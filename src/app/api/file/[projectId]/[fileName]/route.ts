import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/connectDB";
import FileModel from "@/models/FileModel";

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname.split("/");
  console.log("Pathname:", pathname); // Log pathname for debugging

  const projectId = pathname[pathname.length - 2];
  const fileName = pathname[pathname.length - 1];

  console.log("Extracted projectId:", projectId);
  console.log("Extracted fileName:", fileName);

  if (!projectId || !fileName) {
    return new NextResponse("Missing projectId or fileName", {
      status: 400,
      headers: {
        "content-type": "text/html",
      },
    });
  }

  const extArray = fileName.split(".");
  const extension = extArray[extArray.length - 1];

  try {
    await connectDB();
    const getFile = await FileModel.findOne({
      name: fileName,
      projectId: projectId,
    });

    if (!getFile) {
      return new NextResponse("File not found", {
        status: 404,
        headers: {
          "content-type": "text/html",
        },
      });
    }

    const content = getFile.content;

    if (extension === "html") {
      const host = request.headers.get("host");
      const protocol = host?.includes("localhost") ? "http" : "https";
      const DOMAIN = `${protocol}://${host}`;
      const URL = `${DOMAIN}/api/file/${projectId}`;

      const replaceHTML = content.replace(
        /(src|href)=["']@(.*?)["']/g,
        `$1="${URL}$2"`
      );

      return new NextResponse(replaceHTML, {
        headers: {
          "content-type": "text/html",
        },
      });
    } else if (extension === "css") {
      return new NextResponse(content, {
        headers: {
          "content-type": "text/css",
        },
      });
    } else if (extension === "js") {
      return new NextResponse(content, {
        headers: {
          "content-type": "text/javascript",
        },
      });
    } else {
      return new NextResponse(content, {
        headers: {
          "content-type": "text/plain",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching file:", error); // Log the error for debugging
    return new NextResponse("Something went wrong", {
      status: 500,
      headers: {
        "content-type": "text/html",
      },
    });
  }
}
