// Types for complex numbers and fault calculations

export interface Complex {
  x: number;
  y: number;
}

export interface VectorData {
  VA: Complex;
  VB: Complex;
  VC: Complex;
  IA: Complex;
  IB: Complex;
  IC: Complex;
  ZA: Complex;
  ZB: Complex;
  ZC: Complex;
  Z0: Complex;
  Z1: Complex;
  Z2: Complex;
  I0: Complex;
  I1: Complex;
  I2: Complex;
  V0: Complex;
  V1: Complex;
  V2: Complex;
}

export interface InputFieldData {
  key: string;
  value: Complex;
}

export interface DiagramPositions {
  MoveDiagramRight: number;
  MoveDiagramDow: number;
  LeftPosition: number;
  Line_S_Length: number;
  Line_E_Length: number;
  Line_U_Length: number;
  Line_E_Position: number;
  Line_S_U_Position: number;
  Line_L_Position: number;
  Generator_S_Position_x: number;
  Generator_S_Position_y: number;
  Ground_Position: number;
  LeftBusPosition: number;
  RightBusPosition: number;
  Generator_U_Position: number;
  Generator_Radius: number;
}

export interface ElectricalParams {
  Voltage: number;
  lineLength: number;
  Sb: number;
  distanceToFault: number;
  Z1x: number;
  Z1y: number;
  Z0x: number;
  Z0y: number;
  Z_Fx: number;
  Z_Fy: number;
}
