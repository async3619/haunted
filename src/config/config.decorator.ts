import { Inject } from "@nestjs/common";

export const CONFIG_DATA = "CONFIG_DATA";

export function InjectConfig() {
    return Inject(CONFIG_DATA);
}
