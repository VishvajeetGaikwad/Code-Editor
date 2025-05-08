import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/connectDB";
import FileModel from "@/models/FileModel";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; fileName: string } }
) {
  const { projectId, fileName } = params;

  if (!projectId || !fileName) {
    return new NextResponse("Missing projectId or fileName", {
      status: 400,
      headers: {
        "content-type": "text/html",
      },
    });
  }

  // Extract file extension
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

      // Replace @/path with absolute URL for src/href
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
    return new NextResponse("Something went wrong", {
      status: 500,
      headers: {
        "content-type": "text/html",
      },
    });
  }
}
