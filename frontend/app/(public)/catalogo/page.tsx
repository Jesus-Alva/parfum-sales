"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, imageUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/store/cartStore";
import CheckoutModal from "@/components/sales/CheckoutModal";
import {
    Search,
    SlidersHorizontal,
    X,
    ShoppingBag,
    Star,
} from "lucide-react";

type Filters = {
    search: string;
    gender: string;
    brand: string;
    family: string;
    tipo: string;
    min_price: string;
    max_price: string;
    in_stock: boolean;
    sort_by: string;
};

const initialFilters: Filters = {
    search: "",
    gender: "",
    brand: "",
    family: "",
    tipo: "",
    min_price: "",
    max_price: "",
    in_stock: false,
    sort_by: "recent",
};

export default function CatalogPage() {
    const router = useRouter();
    const [perfumes, setPerfumes] = useState<any[]>([]);
    const [options, setOptions] = useState<any>({
        brands: [],
        families: [],
        tipos: [],
        price_min: 0,
        price_max: 0,
    });
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [isAuthed, setIsAuthed] = useState(false);
    const [quickBuyItem, setQuickBuyItem] = useState<CartItem | null>(null);
    const addToCart = useCartStore((state) => state.add);

    // Cargar opciones de filtro una vez
    useEffect(() => {
        setIsAuthed(!!getToken());
        api.get("/perfumes/filters/options").then((r) => setOptions(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        const syncAuth = () => setIsAuthed(!!getToken());
        window.addEventListener("scentia:auth-change", syncAuth);
        return () => window.removeEventListener("scentia:auth-change", syncAuth);
    }, []);

    // Cargar perfumes cada vez que cambien los filtros (con debounce)
    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            const params: any = {};
            Object.entries(filters).forEach(([k, v]) => {
                if (v === "" || v === false || v === null) return;
                params[k] = v;
            });
            api
                .get("/perfumes/", { params })
                .then((r) => setPerfumes(r.data))
                .catch(() => { })
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters]);

    const activeCount = useMemo(() => {
        return Object.entries(filters).filter(
            ([k, v]) =>
                v !== "" && v !== false && k !== "sort_by" && k !== "search"
        ).length;
    }, [filters]);

    const update = (k: keyof Filters, v: any) =>
        setFilters((prev) => ({ ...prev, [k]: v }));

    const clearAll = () => setFilters(initialFilters);

    const goToDetail = (id: number) => router.push(`/perfumes/${id}`);

    const handleAddToCart = (event: React.MouseEvent, perfume: any) => {
        event.stopPropagation();
        if (!getToken()) {
            setIsAuthed(false);
            router.push(`/login?next=/perfumes/${perfume.id}`);
            return;
        }
        addToCart({ perfumeId: perfume.id, name: perfume.name, brand: perfume.brand, imageUrl: perfume.image_url || "", price: perfume.price, stock: perfume.stock, quantity: 1 });
    };

    const handleBuyNow = (event: React.MouseEvent, perfume: any) => {
        event.stopPropagation();
        if (!getToken()) {
            setIsAuthed(false);
            router.push(`/login?next=/perfumes/${perfume.id}`);
            return;
        }
        setQuickBuyItem({ perfumeId: perfume.id, name: perfume.name, brand: perfume.brand, imageUrl: perfume.image_url || "", price: perfume.price, stock: perfume.stock, quantity: 1 });
    };

    return (
        <>
        <div className="min-h-screen pt-24 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="font-display text-5xl md:text-6xl mb-3">
                        <span className="text-gradient-gold">Catálogo</span>
                    </h1>
                    <p className="text-scentia-muted">
                        Explora toda nuestra colección de fragancias
                    </p>
                </motion.div>

                {/* Barra de búsqueda + toggle filtros */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-scentia-muted"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, marca, notas..."
                            value={filters.search}
                            onChange={(e) => update("search", e.target.value)}
                            className="w-full bg-scentia-card border border-scentia-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-scentia-gold transition"
                        />
                        {filters.search && (
                            <button
                                onClick={() => update("search", "")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-scentia-muted hover:text-scentia-text"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className="md:hidden flex items-center justify-center gap-2 bg-scentia-card border border-scentia-border rounded-xl px-5 py-3 hover:border-scentia-gold transition"
                    >
                        <SlidersHorizontal size={16} />
                        Filtros {activeCount > 0 && `(${activeCount})`}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
                    {/* ─── SIDEBAR FILTROS ──────────────────────── */}
                    <aside
                        className={`${showFilters ? "block" : "hidden"
                            } md:block space-y-5`}
                    >
                        <div className="glass rounded-2xl p-5 space-y-5 sticky top-24">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display text-lg text-gradient-gold">
                                    Filtros
                                </h3>
                                {activeCount > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-scentia-muted hover:text-scentia-gold transition"
                                    >
                                        Limpiar ({activeCount})
                                    </button>
                                )}
                            </div>

                            {/* Ordenamiento */}
                            <FilterGroup label="Ordenar por">
                                <select
                                    value={filters.sort_by}
                                    onChange={(e) => update("sort_by", e.target.value)}
                                    className="w-full bg-scentia-card border border-scentia-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-scentia-gold"
                                >
                                    <option value="recent">Más recientes</option>
                                    <option value="price_asc">Precio: menor a mayor</option>
                                    <option value="price_desc">Precio: mayor a menor</option>
                                    <option value="name">Nombre (A-Z)</option>
                                </select>
                            </FilterGroup>

                            {/* Género */}
                            <FilterGroup label="Género">
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { v: "", l: "Todos" },
                                        { v: "masculine", l: "Masculino" },
                                        { v: "feminine", l: "Femenino" },
                                        { v: "unisex", l: "Unisex" },
                                    ].map((opt) => (
                                        <Chip
                                            key={opt.v}
                                            active={filters.gender === opt.v}
                                            onClick={() => update("gender", opt.v)}
                                        >
                                            {opt.l}
                                        </Chip>
                                    ))}
                                </div>
                            </FilterGroup>

                            {/* Marca */}
                            {options.brands.length > 0 && (
                                <FilterGroup label="Marca">
                                    <select
                                        value={filters.brand}
                                        onChange={(e) => update("brand", e.target.value)}
                                        className="w-full bg-scentia-card border border-scentia-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-scentia-gold"
                                    >
                                        <option value="">Todas</option>
                                        {options.brands.map((b: string) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </FilterGroup>
                            )}

                            {/* Familia */}
                            {options.families.length > 0 && (
                                <FilterGroup label="Familia olfativa">
                                    <select
                                        value={filters.family}
                                        onChange={(e) => update("family", e.target.value)}
                                        className="w-full bg-scentia-card border border-scentia-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-scentia-gold"
                                    >
                                        <option value="">Todas</option>
                                        {options.families.map((f: string) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>
                                </FilterGroup>
                            )}

                            {/* Tipo */}
                            {options.tipos.length > 0 && (
                                <FilterGroup label="Tipo">
                                    <select
                                        value={filters.tipo}
                                        onChange={(e) => update("tipo", e.target.value)}
                                        className="w-full bg-scentia-card border border-scentia-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-scentia-gold"
                                    >
                                        <option value="">Todos</option>
                                        {options.tipos.map((t: string) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </FilterGroup>
                            )}

                            {/* Precio */}
                            <FilterGroup label="Rango de precio">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Mín"
                                        value={filters.min_price}
                                        onChange={(e) => update("min_price", e.target.value)}
                                        className="w-full bg-scentia-card border border-scentia-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-scentia-gold"
                                    />
                                    <span className="text-scentia-muted">—</span>
                                    <input
                                        type="number"
                                        placeholder="Máx"
                                        value={filters.max_price}
                                        onChange={(e) => update("max_price", e.target.value)}
                                        className="w-full bg-scentia-card border border-scentia-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-scentia-gold"
                                    />
                                </div>
                            </FilterGroup>

                            {/* Stock */}
                            <FilterGroup label="Disponibilidad">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={filters.in_stock}
                                        onChange={(e) => update("in_stock", e.target.checked)}
                                        className="accent-scentia-gold w-4 h-4"
                                    />
                                    Solo en stock
                                </label>
                            </FilterGroup>
                        </div>
                    </aside>

                    {/* ─── RESULTADOS ───────────────────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-scentia-muted">
                                {loading
                                    ? "Buscando..."
                                    : `${perfumes.length} resultado${perfumes.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="glass rounded-2xl p-5 animate-pulse"
                                    >
                                        <div className="aspect-square rounded-xl bg-scentia-card mb-4" />
                                        <div className="h-3 bg-scentia-card rounded w-1/3 mb-2" />
                                        <div className="h-5 bg-scentia-card rounded w-2/3 mb-2" />
                                        <div className="h-3 bg-scentia-card rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : perfumes.length === 0 ? (
                            <div className="glass rounded-2xl p-12 text-center">
                                <p className="text-scentia-muted mb-3">
                                    No hay perfumes que coincidan con tu búsqueda.
                                </p>
                                {activeCount > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-scentia-gold hover:underline text-sm"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {perfumes.map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        whileHover={{ y: -6 }}
                                        onClick={() => goToDetail(p.id)}
                                        className="glass rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="aspect-square rounded-xl mb-4 bg-gradient-to-br from-scentia-card to-scentia-bg flex items-center justify-center overflow-hidden relative">
                                            {p.image_url ? (
                                                <img
                                                    src={imageUrl(p.image_url)}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                                />
                                            ) : (
                                                <span className="font-display text-5xl text-scentia-gold/40">
                                                    S
                                                </span>
                                            )}
                                            {p.stock <= 0 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-xs uppercase tracking-widest text-red-400 border border-red-400 px-3 py-1 rounded-full">
                                                        Agotado
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs uppercase tracking-widest text-scentia-gold mb-1">
                                            {p.brand}
                                        </p>
                                        <h3 className="font-display text-xl mb-1">{p.name}</h3>
                                        <p className="text-xs text-scentia-muted mb-3 line-clamp-1">
                                            {p.family || p.tipo} · {p.volume_ml}ml
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold text-gradient-gold">
                                                ${p.price.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-scentia-muted">
                                                {p.stock > 0 ? `${p.stock} disp.` : "—"}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button type="button" disabled={p.stock <= 0} onClick={(event) => handleBuyNow(event, p)} className="flex-1 rounded-lg border border-scentia-gold/40 px-2 py-2 text-sm text-scentia-gold transition hover:bg-scentia-gold/10 disabled:opacity-40">Realizar pedido</button>
                                            <button type="button" disabled={p.stock <= 0} onClick={(event) => handleAddToCart(event, p)} className="flex-1 rounded-lg bg-gradient-to-r from-scentia-gold to-scentia-gold-soft px-2 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-40">Agregar al carrito</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {quickBuyItem && <CheckoutModal items={[quickBuyItem]} onClose={() => setQuickBuyItem(null)} onComplete={() => undefined} />}
        </>
    );
}

// ─── Sub-componentes ───────────────────────────

function FilterGroup({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <p className="text-xs uppercase tracking-widest text-scentia-muted mb-2">
                {label}
            </p>
            {children}
        </div>
    );
}

function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs transition border ${active
                    ? "bg-scentia-gold text-black border-scentia-gold font-semibold"
                    : "border-scentia-border text-scentia-muted hover:border-scentia-gold/40 hover:text-scentia-text"
                }`}
        >
            {children}
        </button>
    );
}
