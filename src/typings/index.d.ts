/// <reference types="react" />
declare interface ObjAny {
  [key: string]: any;
}

declare interface ObjT<T> {
  [key: string]: T;
}

declare type WithUndefined<T> = T | undefined;

declare module "*.jpg";
declare module "*.png";
declare module "*.svg";

declare type StyleProps = React.HTMLAttributes<HTMLDivElement>["style"] & Record<string, string>;
