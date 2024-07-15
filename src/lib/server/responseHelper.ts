
export enum ContentType {
    JSON = "application/json",
    TEXT = "text/plain;charset=UTF-8",
}

export enum Status {
    // Success
    OK = 200,
    // Client Error
    BAD_REQUEST = 400,
    // Server Error
    INTERNAL_SERVER_ERROR = 500,
}

export class ResponseHelper {
    private contentType: ContentType = ContentType.TEXT
    private status: Status | number = Status.OK

    public ContentType(type: ContentType): ResponseHelper {
        this.contentType = type;
        return this;
    }

    public Status(status: Status | number): ResponseHelper {
        this.status = status
        return this;
    }

    public toStatus(): number {
        return this.status
    }

    public toInit(): ResponseInit {
        return {
            status: this.toStatus(),
            headers: this.toHeaders(),
        }
    }

    public toHeaders(): Headers {
        const headers = new Headers();
        headers.append("Content-Type", this.contentType);
        return headers;
    }
}