export default abstract class BaseServer {
    public abstract start(port: number): Promise<void>;
}
