import { MidwayHttpError } from '@midwayjs/core';

export class BizError extends MidwayHttpError {
  public code: string;
  constructor(code: string, status: number, message?: string) {
    super(message || code, status);
    this.code = code;
  }
}
