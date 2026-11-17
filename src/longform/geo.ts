// Proyeksi Mercator untuk peta kartu (lon/lat -> piksel), pas ke kotak W x H dengan view [lon0, lat0, lon1, lat1].
export type View = [number, number, number, number];
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

export const makeProj = (view: View, W: number, H: number) => {
  const [lon0, lat0, lon1, lat1] = view;
  const x0 = (lon0 * Math.PI) / 180, x1 = (lon1 * Math.PI) / 180;
  const y0 = merc(lat0), y1 = merc(lat1);
  const k = Math.min(W / (x1 - x0), H / (y1 - y0));
  const ox = (W - k * (x1 - x0)) / 2, oy = (H - k * (y1 - y0)) / 2;
  const p = (lon: number, lat: number): [number, number] => [ox + k * ((lon * Math.PI) / 180 - x0), oy + k * (y1 - merc(lat))];
  return { p, k };
};

export const ringPath = (ring: number[], p: (lon: number, lat: number) => [number, number]) => {
  let d = "";
  for (let i = 0; i < ring.length; i += 2) {
    const [x, y] = p(ring[i], ring[i + 1]);
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d + "Z";
};
