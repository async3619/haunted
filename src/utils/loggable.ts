import { Logger } from "@nestjs/common";

export abstract class Loggable<TName extends string = string> {
    protected readonly logger: Logger;

    protected constructor(public readonly name: TName) {
        this.logger = new Logger(name);
    }

    public getName(): string {
        return this.name;
    }
}
