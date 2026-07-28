import { FormEvent, useMemo, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AdminShell from '@/layouts/admin-shell';
import { PanelCard } from '@/components/dashboard-layout';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Primitive = string | number | null;

export interface CrudField {
    name: string;
    label: string;
    type?: 'text' | 'textarea' | 'select' | 'datetime-local';
    placeholder?: string;
    options?: { label: string; value: string }[];
}

export interface CrudColumn {
    key: string;
    label: string;
    type?: 'text' | 'badge';
    tones?: Record<string, string>;
}

interface CrudItem {
    id: number;
    [key: string]: Primitive;
}

interface CrudStat {
    label: string;
    value: string;
}

interface Props {
    title: string;
    description: string;
    icon: LucideIcon;
    pageTitle: string;
    items: CrudItem[];
    fields: CrudField[];
    columns: CrudColumn[];
    stats: CrudStat[];
    createRoute: string;
    updateRoute: string;
    deleteRoute: string;
    emptyMessage: string;
    createLabel?: string;
    rowAction?: { label: string; href: (item: CrudItem) => string };
}

export function EntityManager({
    title,
    description,
    icon: Icon,
    pageTitle,
    items,
    fields,
    columns,
    stats,
    createRoute,
    updateRoute,
    deleteRoute,
    emptyMessage,
    createLabel = 'Add Entry',
    rowAction,
}: Props) {
    const page = usePage<{ flash?: { status?: string } }>();
    const [editingItem, setEditingItem] = useState<CrudItem | null>(null);

    const initialValues = useMemo(
        () =>
            fields.reduce<Record<string, string>>((carry, field) => {
                carry[field.name] = '';

                return carry;
            }, {}),
        [fields],
    );

    const createForm = useForm({ ...initialValues });
    const editForm = useForm({ ...initialValues });

    const startEdit = (item: CrudItem) => {
        setEditingItem(item);

        editForm.setData(
            fields.reduce<Record<string, string>>((carry, field) => {
                carry[field.name] = String(item[field.name] ?? '');

                return carry;
            }, {}),
        );
        editForm.clearErrors();
    };

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createForm.post(route(createRoute), {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    };

    const submitEdit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingItem) {
            return;
        }

        editForm.patch(route(updateRoute, editingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const destroyItem = (item: CrudItem) => {
        router.delete(route(deleteRoute, item.id), { preserveScroll: true });
    };

    return (
        <AdminShell>
            <Head title={pageTitle} />

            <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Button type="button" onClick={() => createForm.reset()}>
                    <Plus className="h-4 w-4" />
                    {createLabel}
                </Button>
            </header>

            {page.props.flash?.status && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {page.props.flash.status}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <PanelCard key={stat.label} title={stat.label}>
                        <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    </PanelCard>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)]">
                <PanelCard title="Current Records">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        {columns.map((column) => (
                                            <th key={column.key} className="py-3 font-medium">
                                                {column.label}
                                            </th>
                                        ))}
                                        <th className="py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-border last:border-0">
                                            {columns.map((column) => {
                                                const value = String(item[column.key] ?? '-');

                                                return (
                                                    <td key={column.key} className="py-3 align-top text-foreground">
                                                        {column.type === 'badge' ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className={column.tones?.[value] ?? 'bg-secondary text-secondary-foreground'}
                                                            >
                                                                {value}
                                                            </Badge>
                                                        ) : (
                                                            <span className="block whitespace-pre-wrap text-sm text-foreground/90">{value}</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="py-3">
                                                <div className="flex justify-end gap-2">
                                                    {rowAction && (
                                                        <Link
                                                            href={rowAction.href(item)}
                                                            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                                                        >
                                                            {rowAction.label}
                                                        </Link>
                                                    )}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => destroyItem(item)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </PanelCard>

                <PanelCard title={createLabel}>
                    <form className="space-y-4" onSubmit={submitCreate}>
                        {fields.map((field) => (
                            <FieldControl
                                key={field.name}
                                field={field}
                                value={createForm.data[field.name]}
                                error={createForm.errors[field.name]}
                                onChange={(value) => createForm.setData(field.name, value)}
                            />
                        ))}
                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={createForm.processing}>
                                Save Record
                            </Button>
                            <Button type="button" variant="outline" onClick={() => createForm.reset()}>
                                Clear
                            </Button>
                        </div>
                    </form>
                </PanelCard>
            </div>

            <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Record</DialogTitle>
                        <DialogDescription>Update this entry without leaving the admin dashboard.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={submitEdit}>
                        {fields.map((field) => (
                            <FieldControl
                                key={field.name}
                                field={field}
                                value={editForm.data[field.name]}
                                error={editForm.errors[field.name]}
                                onChange={(value) => editForm.setData(field.name, value)}
                            />
                        ))}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminShell>
    );
}

function FieldControl({
    field,
    value,
    error,
    onChange,
}: {
    field: CrudField;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'textarea' ? (
                <textarea
                    id={field.name}
                    value={value}
                    placeholder={field.placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
            ) : field.type === 'select' ? (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger id={field.name}>
                        <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    id={field.name}
                    type={field.type === 'datetime-local' ? 'datetime-local' : 'text'}
                    value={value}
                    placeholder={field.placeholder}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
            <InputError message={error} />
        </div>
    );
}
