export type Point = {
  x: number;
  y: number;
};

export type MaybePoint = {
  x: number | undefined;
  y: number | undefined;
};

export type Point3D = Point & {
  z: number;
};
