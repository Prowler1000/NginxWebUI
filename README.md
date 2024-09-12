# nginx
Custom Nginx Docker for http3 support.

This image isn't really meant to be used in a general sense as I didn't set it up with broad/generic use cases in mind. This doesn't mean you can't use it, just that you should keep it in mind.

### Mounts
This image has mounts at `/config`, `/ssl`, and `/log`. 

### Web UI
The web ui is currently experimental and very unstyled. All configuration that can be done through the UI can also be done through appropriate API endpoints to hopefully allow for easier extendability. The container expects an environment variable `DATABASE_URL` in the form `postgresql://<database username>:<password>@<database IP/URL>:<database port>/<database name>`. Database migrations are applied automatically on container startup. Since this is a work in progress / experimental, there may be undocumented breaking changes. If anyone desires to actually use this though, please open a discussion and I'd be happy to start documenting breaking changes, the API, and anything else that needs documenting.