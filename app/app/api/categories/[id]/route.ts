import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true, // subcategories
        products: true, // associated products
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has products
    if (existing.products.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with products', 
          productCount: existing.products.length 
        }, 
        { status: 400 }
      );
    }

    // Delete all subcategories and their items first
    if (existing.children.length > 0) {
      for (const subcat of existing.children) {
        // Delete items under this subcategory
        await prisma.category.deleteMany({
          where: { parentId: subcat.id },
        });
      }
      
      // Delete subcategories
      await prisma.category.deleteMany({
        where: { parentId: id },
      });
    }

    // Delete the main category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      deletedId: id 
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    
    // Check for foreign key constraint errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot delete category. It may have associated products or subcategories.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
