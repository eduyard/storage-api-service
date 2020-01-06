### FileStorage API Service

#### Common idea:
Provide API for securely upload file(s) over pre-signed upload endpoints.<br/>
Provide parallel upload capability to multiple servers at a time.<br/>
Provide ability to synchronize files between FS Cluster members.

#### Operational steps:

- Client requests FSAPI and creates **signed upload endpoint** by providing **access token** and **list of files (with their size)**. Access token - asymmetric JWT string which holds ownership identifiers. 
- Server creates Batch record and File records in database for every valid file.
- Server responds with same **list of files (with their size)** populated with **unique endpoints** for each file or populated with **failure** information for specific file.
- Client sends `multipart/form-data` by providing dedicated file to dedicated endpoint. API will reject file with different filename and size.
- API saves every file to specific path and shares information to other storage cluster members.
- Every cluster member downloads file from source member and save record in local database that it holds that file too.

#### Database objects:

**Batch** - struct that holds general context for group of files (folder).<br/>
**File** - struct that holds all necessary metadata and relational context information.<br/>

#### Step by step with examples:

1) Creating signed upload endpoint:

REQUEST
```
POST /upload/prepare
Content-Type: application/json
Authorization: Bearer {JWT TOKEN}
{
  "files": [
    {"filename": "(asdšßbã%     %.jpeg", "size": 5241, "tags": ["shitty", "file", "name"]},
    {"filename": "“♣☺♂” , “”‘-!@#$%^&(),.][ !–”, “${code}”;–abc.jpg", "size": 118645, "tags": ["shitty", "file", "name"]},
    {"filename": "рашн файл нейм.jpg", "size": 1},
    {"filename": "image.jpg", "size": 10450},
    {"filename": "non-image.zip", "tags": ["files", "home work", "reports"], "size": 1024000},
    {"filename": "not-allowed-extension.acd", "size": 1024000},
    {"filename": "not-allowed-size.jpg", "size": 40024000}
  ]
}
```

RESPONSE
```
Content-Type: application/json
{
    "batch": "d9e9f136-58de-4b52-9075-39bb8857c195",
    "result": [
        {
            "name": "asdsssba.jpeg",
            "originalName": "(asdšßbã%     %.jpeg",
            "size": 5241,
            "tags": ["shitty", "file", "name"],
            "mimeType": "image/jpeg",
            "isImage": true,
            "valid": true,
            "ok": true,
            "id": "571fddc0-b40a-4d16-af8c-bf7a41d3bb60",
            "uploadUrl": "https://storx.smls.com.ua/upload/571fddc0-b40a-4d16-af8c-bf7a41d3bb60"
        },
        {
            "name": "-code-abc.jpg"
            "originalName": "“♣☺♂” , “”‘-!@#$%^&(),.][ !–”, “${code}”;–abc.jpg",
            "size": 118645,
            "mimeType": "image/jpeg",
            "tags": ["shitty", "file", "name"],
            "isImage": true,
            "valid": true,
            "ok": true,
            "id": "0e314383-23b9-43e7-b51c-bd466bd6dbd6",
            "uploadUrl": "https://storx.smls.com.ua/upload/0e314383-23b9-43e7-b51c-bd466bd6dbd6"
        },
        {
            "name": "rashn fayl neim.jpg"
            "originalName": "рашн файл нейм.jpg",
            "size": 1,
            "tags": [].
            "mimeType": "image/jpeg",
            "isImage": false,
            "valid": false,
            "ok": false,
            "error": "File does not contain image data",
        },
        {
            "filename": "non-image.zip",
            "size": 1024000,
            "tags": ["files", "home work", "reports"],
            "mimeType": "application/zip",
            "isImage": false,
            "valid": true,
            "ok": true,
            "id": "19c92b1b-3042-42ba-86db-1c8c82eab1bf",
            "uploadUrl": "https://storx.smls.com.ua/upload/19c92b1b-3042-42ba-86db-1c8c82eab1bf"
        },
        {
            "filename": "not-allowed-extension.acd",
            "size": 1024000,
            "mimeType": "Not allowed",
            "isImage": false,
            "valid": false,
            "error": "File extension not allowed",
            "ok": false
        },
        {
            "filename": "not-allowed-size.jpg",
            "size": 40024000,
            "mimeType": "image/jpeg",
            "isImage": true,
            "valid": false,
            "error": "File size exceeds allowed limit",
            "ok": false
        }
    ]
}
```

2) Uploading single file using `uploadUrl` from `/upload/prepare` response:

REQUEST:
```
POST /upload/19c92b1b-3042-42ba-86db-1c8c82eab1bf HTTP/1.1
Host: storx.smls.com.ua
Content-Type: multipart/form-data; boundary=---------------------------9051914041544843365972754266
Content-Length: 1024000
-----------------------------9051914041544843365972754266
Content-Disposition: form-data; name="file"; filename="non-image.zip"
content of non-image.zip here...
-----------------------------9051914041544843365972754266
```

RESPONSE:
```
201 CREATED
Content-Type: application/json
{
    "filename": "non-image.zip",
    "size": 1024000,
    "tags": ["files", "home work", "reports"],
    "mimeType": "application/zip",
    "isImage": false,
    "valid": true,
    "ok": true,
    "id": "19c92b1b-3042-42ba-86db-1c8c82eab1bf",
    "batch": "d9e9f136-58de-4b52-9075-39bb8857c195",
    "fileUrl": "https://storx.smls.com.ua/files/19c92b1b-3042-42ba-86db-1c8c82eab1bf/non-image.zip",
    "batchUrl": "https://storx.smls.com.ua/batches/d9e9f136-58de-4b52-9075-39bb8857c195"
}
```

#### URLs:

URL for direct file access:
```
https://{hostname}/files/{id}/{filename}
```

URL for file management (REST API):
```
https://{hostname}/files/{id}
```

URL for batch management (REST API):
```
https://{hostname}/batches/{batch}
```

#### Distribution logic:

When file is uploaded to one of servers (uploadUrl param may have different hostnames for effective network usage) it informs another cluster members about new data to make them retrieve that file too.

If because of network or some other reasons one or more of servers will not be informed they will not have that file.

But when user will try to access that file using server which does not have information about that file it will "talk" to other servers to proxy and save it at same time.

#### Security logic:

Using REST API any of entities (batch, file) we can set dynamic ACL on it to make it available only for logged in users of requesting system.

To achieve it will require to install on requesting system some module which will be "asked" if it's allowed to give or not using access token that will be shared.

Example: 

`User A` logged in SMLS and has access token to work with SMLS.

When user tries to access some private file using one of storage server urls it will require access token in `Authorization: Bearer {token}`.

Storage API will request to storage ACL backend on SMLS server and will check access token for availability, if everything is ok it will respond with 200 and contents of file, otherwise it will give 403 Forbidden message.
