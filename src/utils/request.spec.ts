import { Request } from "@utils/request";

describe("Request", () => {
    describe("Builder", () => {
        it("should be able to set the method", () => {
            const request = Request.create().withMethod("get");
            const postRequest = Request.create().withMethod("post");

            expect(request.options.method).toBe("get");
            expect(postRequest.options.method).toBe("post");
        });

        it("should be able to set the scheme", () => {
            const request = Request.create().withScheme("http");
            const httpsRequest = Request.create().withScheme("https");

            expect(request.options.scheme).toBe("http");
            expect(httpsRequest.options.scheme).toBe("https");
        });

        it("should be able to set the host", () => {
            const request = Request.create().withHost("localhost");
            const exampleRequest = Request.create().withHost("example.com");

            expect(request.options.host).toBe("localhost");
            expect(exampleRequest.options.host).toBe("example.com");
        });

        it("should be able to set the port", () => {
            const request = Request.create().withPort(80);
            const httpsRequest = Request.create().withPort(443);

            expect(request.options.port).toBe(80);
            expect(httpsRequest.options.port).toBe(443);
        });

        it("should be able to set the path", () => {
            const request = Request.create().withPath("/path");
            const exampleRequest = Request.create().withPath("/path/to/resource");

            expect(request.options.path).toBe("/path");
            expect(exampleRequest.options.path).toBe("/path/to/resource");
        });

        it("should be able to set the query", () => {
            expect(Request.create().withQuery({ key: "value" }).options.query).toEqual({ key: "value" });
            expect(Request.create().withQuery({ key: "value", key2: "value2" }).options.query).toEqual({
                key: "value",
                key2: "value2",
            });

            expect(Request.create().withQuery({ numeric: 123 }).options.query).toEqual({ numeric: "123" });
            expect(Request.create().withQuery({ array: ["1", "2", "3"] }).options.query).toEqual({ array: "1,2,3" });
        });

        it("should be able to set the auth token", () => {
            const request = Request.create().withAuth("token");
            const exampleRequest = Request.create().withAuth("token2");

            expect(request.options.headers).toEqual({ Authorization: "Bearer token" });
            expect(exampleRequest.options.headers).toEqual({ Authorization: "Bearer token2" });
        });

        it("should be able to get the url", () => {
            const request = Request.create().withScheme("http").withHost("localhost").withPort(80).withPath("/path");

            expect(request.url).toBe("http://localhost/path");
        });

        it("should strip out port number if it is the default for the scheme", () => {
            expect(Request.create().withScheme("http").withHost("localhost").withPort(80).url).toBe("http://localhost");

            expect(Request.create().withScheme("http").withHost("localhost").withPort(8080).url).toBe(
                "http://localhost:8080",
            );

            expect(Request.create().withScheme("https").withHost("localhost").withPort(443).url).toBe(
                "https://localhost",
            );

            expect(Request.create().withScheme("https").withHost("localhost").withPort(8080).url).toBe(
                "https://localhost:8080",
            );
        });

        it("should throw an error if the url is missing components", () => {
            expect(() => Request.create().url).toThrowError("Missing components necessary to construct URI");
            expect(() => Request.create().withScheme("http").url).toThrowError(
                "Missing components necessary to construct URI",
            );
            expect(() => Request.create().withScheme("http").withHost("localhost").url).toThrowError(
                "Missing components necessary to construct URI",
            );
            expect(() => Request.create().withScheme("http").withHost("localhost").withPort(80).url).not.toThrowError(
                "Missing components necessary to construct URI",
            );
        });
    });
});
