import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../lib/dbConnect";
import productModel from "../../../models/product";
import "../../../models/category";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const cat = searchParams.get("cat");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const skip = (page - 1) * limit;

  try {
    await dbConnect();

    let filter: any = {}; //filter query
    if (category) {
      filter.categories = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (cat) {
      const products = await productModel.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "categories",
            foreignField: "_id",
            as: "categories",
          },
        },
        {
          $addFields: {
            category: { $first: "$categories" },
          },
        },
        {
          $project: {
            categories: 0,
          },
        },
        {
          $match: {
            "category.title": {
              $regex: cat,
              $options: "i",
            },
          },
        },
      ]);

      const totalProducts = products?.length || 0;

      return NextResponse.json(
        {
          status: true,
          message: "Products Found Successfully!",
          data: {
            totalProducts,
            page,
            limit,
            totalPages: Math.ceil(totalProducts / limit),
            products,
          },
        },
        { status: 200 }
      );
    }

    const totalProducts = await productModel.countDocuments();
    const products = await productModel
      .find(filter)
      .populate("categories")
      .skip(skip)
      .limit(limit);

    console.log("prodc", products);
    return NextResponse.json(
      {
        status: true,
        message: "Products Found Successfully!",
        data: {
          totalProducts,
          page,
          limit,
          totalPages: Math.ceil(totalProducts / limit),
          products,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error Occurred:", error);

    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      discount,
      category,
      slug,
      banner,
      quantity,
      stockStatus,
    } = body;

    if (!title || !price) {
      return NextResponse.json(
        { status: false, message: "Missing required fields!" },
        { status: 400 }
      );
    }

    await dbConnect();

    // ✅ Store product in database with uploaded banner file
    const product = await productModel.create({
      title,
      description,
      price,
      stockStatus,
      banner, // Store the first uploaded file path as the banner
      discount,
      categories: category,
      quantity,
      slug,
    });

    if (!product) {
      return NextResponse.json(
        { status: false, message: "Failed to create product!" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: true, message: "Product Created Successfully!", data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error Occurred:", error);
    return NextResponse.json(
      { status: false, message: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
