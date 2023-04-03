import { ConfigData, ConfigService } from "@config/config.service";
import * as Resolvers from "@metadata/resolvers";

import { MockResolver } from "@test/utils/installMetadataMock";

export function installConfigMock(configService: ConfigService) {
    jest.spyOn(configService, "getConfig").mockImplementation(() => {
        return {
            resolvers: {
                mocked: {},
            },
        } as ConfigData;
    });

    jest.spyOn(Resolvers, "createResolver").mockImplementation(() => {
        return new MockResolver();
    });
}
