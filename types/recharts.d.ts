// Lightweight declaration to silence editor/TS errors when `recharts` types are unavailable
// Export commonly used components with `any` so named imports work without errors.
declare module "recharts" {
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
  export const ResponsiveContainer: any;
  export const ReferenceLine: any;
  const _default: any;
  export default _default;
}
