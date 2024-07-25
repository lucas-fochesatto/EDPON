import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

function getRandomFileName() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g,"");  
  var random = ("" + Math.random()).substring(2, 8); 
  var random_number = timestamp+random;  
  return random_number;
}

export const POST = async (req: NextRequest) => {
  const data = await req.formData();
  const file : File = data.get("file") as File;
  const isGif = file.name.split('.').pop() === 'gif';

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = getRandomFileName().toString() + (isGif ? ".gif" : ".png");

  const path = join('src', 'images', 'collections', fileName);
  await writeFile(path, buffer);
  console.log(`open ${path} to see the uploaded file`);

  return NextResponse.json({ message: "File uploaded successfully",  path}, {status: 201})
}