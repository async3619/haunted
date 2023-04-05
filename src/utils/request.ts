import fetch from "node-fetch";

type HttpMethod = "get" | "post";
type HttpScheme = "http" | "https";

interface RequestOptions {
    headers: Record<string, string>;
    query: Record<string, string>;
    method: HttpMethod;
    scheme: HttpScheme;
    host: string;
    port: number | undefined;
    path: string;
}

interface BaseResponse {
    statusCode: number;
    headers: Record<string, string>;
}

export interface JsonResponse<T> extends BaseResponse {
    body: T;
}

class RequestBuilder {
    private readonly headers: Record<string, string> = {};
    private query: Record<string, string> = {};
    private method: HttpMethod = "get";
    private scheme: HttpScheme = "http";
    private host = "";
    private path = "";
    private port: number | undefined = undefined;

    public get options(): RequestOptions {
        return {
            headers: { ...this.headers },
            query: { ...this.query },
            method: this.method,
            scheme: this.scheme,
            host: this.host,
            port: this.port,
            path: this.path,
        };
    }

    public get url() {
        if (!this.scheme || !this.host || !this.port) {
            throw new Error("Missing components necessary to construct URI");
        }

        let uri = `${this.scheme}://${this.host}`;
        if ((this.scheme === "http" && this.port !== 80) || (this.scheme === "https" && this.port !== 443)) {
            uri += ":" + this.port;
        }

        if (this.path) {
            uri += this.path;
        }

        return uri;
    }

    public withMethod(method: HttpMethod): RequestBuilder {
        this.method = method;
        return this;
    }

    public withHost(host: string): RequestBuilder {
        this.host = host;
        return this;
    }

    public withPort(port: number): RequestBuilder {
        this.port = port;
        return this;
    }

    public withScheme(scheme: HttpScheme): RequestBuilder {
        this.scheme = scheme;
        return this;
    }

    public withPath(path: string): RequestBuilder {
        this.path = path;
        return this;
    }

    public withQuery(query: Record<string, string | string[] | number | undefined>): RequestBuilder {
        for (const [key, value] of Object.entries(query)) {
            if (!value) {
                continue;
            }

            if (typeof value === "number") {
                this.query[key] = value.toString();
            } else if (Array.isArray(value)) {
                this.query[key] = value.join(",");
            } else {
                this.query[key] = value;
            }
        }

        return this;
    }

    public withAuth(token?: string): RequestBuilder {
        if (!token) {
            return this;
        }

        this.headers.Authorization = `Bearer ${token}`;
        return this;
    }

    public build(): Request {
        return new Request(this);
    }
}

export class Request {
    public static create(): RequestBuilder {
        return new RequestBuilder();
    }

    public constructor(private readonly builder: RequestBuilder) {}

    public async executeJson<T>(): Promise<JsonResponse<T>> {
        const { method, headers, query } = this.builder.options;
        const url = `${this.builder.url}?${new URLSearchParams(query).toString()}`;
        const response = await fetch(url, { method, headers });

        return {
            statusCode: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.json(),
        };
    }
}
