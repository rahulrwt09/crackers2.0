"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    type SortingState,
    getSortedRowModel,
    type ColumnFiltersState,
    getFilteredRowModel,
    type PaginationState, // Import PaginationState
} from "@tanstack/react-table"
import axios from "axios"
import { toast } from "sonner"
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define a type for the pagination metadata from your backend
interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export function ProductsTable() {
    // --- STATE MANAGEMENT ---
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // State for pagination metadata from the backend
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null)

    // State for react-table's pagination. pageIndex is 0-based.
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0, // initial page index
        pageSize: 10, // initial page size
    })

    // --- DATA FETCHING ---
    const fetchProducts = async () => {
        setLoading(true)
        try {
            // Construct the URL with pagination query parameters
            const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}product`)
            url.searchParams.set("page", String(pagination.pageIndex + 1)) // Backend is 1-based
            url.searchParams.set("limit", String(pagination.pageSize))

            const res = await axios.get(url.toString())

            setData(res.data?.data ?? [])
            setPaginationMeta(res.data?.pagination ?? null)
        } catch (error) {
            console.error("Error fetching products:", error)
            toast.error("Failed to fetch products.")
        } finally {
            setLoading(false)
        }
    }

    // Re-fetch data whenever pagination, sorting, or filtering changes
    useEffect(() => {
        fetchProducts()
    }, [pagination.pageIndex, pagination.pageSize]) // Add other dependencies if you implement server-side sort/filter

    // --- TABLE DEFINITION ---
    const columns: ColumnDef<any>[] = [
        // ... your existing columns ... (no changes needed here)
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Product
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <img
                        src={row.original?.banner?.secure_url || "/placeholder.svg"}
                        alt={row.getValue("title")}
                        className="h-10 w-10 rounded-md object-cover"
                    />
                    <span>{row.getValue("title")}</span>
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => <div>{row.original.categories?.title}</div>,
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"))
                const finalPrice = row.original.finalPrice
                return (
                    <div className="flex flex-col">
                        {finalPrice ? (
                            <>
                                <span className="text-sm line-through text-muted-foreground">Rs{price.toFixed(2)}</span>
                                <span className="font-medium text-green-600">Rs{finalPrice}</span>
                            </>
                        ) : (
                            <span className="font-medium">Rs{price.toFixed(2)}</span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
            cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.stockStatus;
                return (
                    <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status === "In Stock"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : status === "Low Stock"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                    >
                        {status}
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const product = row.original;
                const handleDelete = async (id: string) => {
                    const confirmDelete = confirm("Are you sure you want to delete this product ?");
                    if (!confirmDelete) return;

                    try {
                        const deleted = await axios.delete(`/api/product/${id}`);
                        if (deleted.status === 200) {
                            toast.success("Product deleted successfully!");
                            fetchProducts(); // Refetch data to update the table
                        } else {
                            toast.error("Failed to delete product.");
                        }
                    } catch (error) {
                        console.error("Error deleting product:", error);
                        toast.error("An error occurred while deleting the product.");
                    }
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/products/${product._id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(row?.original?._id)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        // --- Manual Pagination Setup ---
        manualPagination: true,
        pageCount: paginationMeta?.totalPages ?? -1, // -1 means we don't know the page count yet
        onPaginationChange: setPagination, // Link table's state to our own
        // --- Other Manual Operations (if you implement them) ---
        // manualSorting: true,
        // manualFiltering: true,
        // --- Standard Setup ---
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        // We no longer need getPaginationRowModel because we're handling it manually
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination, // Pass our pagination state to the table
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    placeholder="Filter products..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {loading ? "Loading products..." : "No results."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            <div className="flex items-center justify-between px-2">
                {/* <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {paginationMeta?.total ?? 0} row(s) selected.
                </div> */}
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}