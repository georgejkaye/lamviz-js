import { Term, Context } from "./Lambda.bs"
import { Fragment } from "../reducers/gallerySlice"

declare module "Generators.bs"
export function initialiseTermBank(n: number, k: number): any
export function generateContext(k: number): Context
export function generateTermsArray(n: number, k: Context, frag: Fragment, mem: any): [Term[], any]
