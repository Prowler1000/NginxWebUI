import assert from "node:assert";

export enum ContentType {
    JSON = "application/json",
    TEXT = "text/plain",
    NONE = ""
}

export enum Status {
    // Success
    OK = 200,
    // Client Error
    BAD_REQUEST = 400,
    // Server Error
    INTERNAL_SERVER_ERROR = 500,
}

export class RequestHelper implements Disposable {
    private responseHelper: ResponseHelper;
    private request: Request;
    private ok: boolean; // False if an error has occured somewhere.

    private content: object = {};

    public constructor(request: Request) {
        this.responseHelper = new ResponseHelper();
        this.request = request;
        this.ok = true;
    }

    public async GetJson(): Promise<object> {
        if (this.ContentType !== ContentType.JSON) {
            this.ok = false;
            
            this.responseHelper
            .ContentType(ContentType.TEXT)
            .Body(`Invalid request type. Expected application/json, got ${this.request.headers.get("Content-Type")}`)
            .Status(Status.BAD_REQUEST);
        }
        else if (Object.keys(this.content).length === 0) {
            try {
                this.content = await this.request.json();
            }
            catch (e) {
                this.ok = false;
                this.responseHelper
                .ContentType(ContentType.TEXT)
                .Body(`An error occured while parsing request JSON. ${e}`)
                .Status(Status.BAD_REQUEST)
            }
        }
        return this.content;
    }

    get ResponseJSON(): object {
        return this.content;
    }

    set ResponseJSON(body: string | object) {
        assert(this.ok);
        this.responseHelper
        .ContentType(ContentType.JSON)
        .Body(typeof body === "string" ? body : JSON.stringify(body))
        .Status(Status.OK);
    }
    
    set ResponseText(body: string) {
        assert(this.ok);
        this.responseHelper
        .ContentType(ContentType.TEXT)
        .Body(body)
        .Status(Status.OK);
    }

    public SetClientError(body: string) {
        assert(this.ok); // We shouldn't be setting an error if an error has already occured
        this.ok = false;
        this.responseHelper
        .ContentType(ContentType.TEXT)
        .Body(body)
        .Status(Status.BAD_REQUEST);
    }

    public SetInternalError(body: string) {
        assert(this.ok); // We shouldn't be setting an error if an error has already occured
        this.ok = false;
        this.responseHelper
        .ContentType(ContentType.TEXT)
        .Body(body)
        .Status(Status.INTERNAL_SERVER_ERROR);
    }

    get ContentType(): ContentType | undefined {
        const type = this.request.headers.get("Content-Type");
        assert(type !== null);
        return Object.values(ContentType).find(x => x === type);
    }

    get OK(): boolean {
        return this.ok;
    }

    get Response(): Response {
        return this.responseHelper.Response;
    }

    [Symbol.dispose]() {
        // We don't currently do anything but we might, so it's probably best
        // to ensure implementations are done accordingly
    }
}

export class ResponseHelper {
    private contentType: ContentType = ContentType.TEXT
    private status: Status | number = Status.OK
    private bodyContent: string | undefined;

    public constructor(message?: string) {
        this.bodyContent = message;
    }

    public ContentType(type: ContentType): ResponseHelper {
        this.contentType = type;
        return this;
    }

    public Status(status: Status | number): ResponseHelper {
        this.status = status;
        return this;
    }

    public Body(content: string): ResponseHelper {
        this.bodyContent = content;
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

    public get Response(): Response {
        return new Response(this.bodyContent, this.toInit());
    }
}