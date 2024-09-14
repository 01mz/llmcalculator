import { NextResponse } from "next/server";

const values = ['123', '456'];

// To handle a GET request to /api/calculate
export async function GET(req: Request) {
    console.log(req);
    return NextResponse.json(values, {
        status: 200
    });
}


// To handle a POST request to /api/calculate
export async function POST(req: Request) {
    const { input, llm } = await req.json();
    console.log(input, llm);
    return NextResponse.json(values[0], {
        status: 200
    });
}