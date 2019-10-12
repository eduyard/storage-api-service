### FileStorage API Service

#### Common idea:
Provide API for securely upload file(s) over presigned upload endpoints.<br/>
Provide parallel upload capability to multiple servers at a time.<br/>
Provide ability to synchronize files between FS Cluster members.

### Operational steps:

- Client requests FSAPI and creates **signed upload endpoint** by providing **access token** and **list of files (with their size)**. Access token - assymmetric JWT string which holds ownership identificators. 
- Server creates Batch record, Transaction records and File records in database for every valid file.
- Server responds with same **list of files (with their size)** populated with **unique endpoints** for each file or populated with **failure** information for specific file.
- Client sends `multipart/form-data` by providing dedicated file to dedicated endpoint. API will reject file with different filename and size.
- API saves every file to specific path and shares information to other storage cluster members.
- Every cluster member downloads file from source member and save record in local database that it holds that file too.

#### Database objects:

**Batch** - truct that holds general context for group of transactions (folder).<br/>
**Transaction** - struct that holds unique file upload context.<br/>
**File** - struct that holds all necessary metadata and relational context information.<br/>
