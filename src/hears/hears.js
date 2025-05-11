import { Composer } from "grammy";
import { exchangeDataHears } from "./exchangeDataHears.js";
import { adminHears } from "./adminHears.js";
import { changeDataMargin } from "./changeDataMargin.js";
import { infoHears } from "./infoHears.js";
import { createAppHears } from "./createAppHears.js";
import { ownerHears } from "./ownerHears.js";

export const hears = new Composer()

hears.use(exchangeDataHears)
hears.use(adminHears)
hears.use(changeDataMargin)
hears.use(infoHears)
hears.use(createAppHears)
hears.use(ownerHears)

