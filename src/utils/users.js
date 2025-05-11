export const isAdmin = (ctx) => {
    return (ctx.user.lvl >= 1)
}

export const isOwner = (ctx) => {
    return (ctx.user.lvl === 2)
}

export const isManager = (ctx) => {
    return (ctx.user.lvl === 1)
}

