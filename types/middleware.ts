import { NextRequest, NextResponse } from 'next/server';

export type NextRequestHandler = (
  req: NextRequest
) => Promise<NextResponse> | NextResponse;

export type MiddlewareFactory = (
  handler: NextRequestHandler
) => NextRequestHandler;