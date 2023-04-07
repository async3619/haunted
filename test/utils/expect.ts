export function expectContainPartiallyInArray(target: any, partialObject: Record<string, any>) {
    return expect(target).toEqual(expect.arrayContaining([expect.objectContaining(partialObject)]));
}

export function expectContainPartially(target: any, partialObject: Record<string, any>) {
    return expect(target).toEqual(expect.objectContaining(partialObject));
}
