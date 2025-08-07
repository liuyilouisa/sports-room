import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    getActivities,
    type Activity,
    type Paginated,
} from "../api/activities";
import ActivityCard from "../components/ActivityCard";
import SearchBar from "../components/SearchBar";
import Spinner from "../components/Spinner";
import Empty from "../components/Empty";

const PAGE_SIZE = 12;

export default function Activities() {
    const [search, setSearch] = useSearchParams();

    const keyword = search.get("keyword") || "";
    const page = Number(search.get("page") || 1);
    const sort = search.get("sort") || "createdAt_DESC";

    const { data, isLoading, isError, error } = useQuery<
        Paginated<Activity>,
        Error,
        Paginated<Activity>,
        readonly [
            string,
            { keyword: string; page: number; size: number; sort: string }
        ]
    >({
        queryKey: [
            "activities",
            { keyword, page, size: PAGE_SIZE, sort },
        ] as const,
        queryFn: () => getActivities({ keyword, page, size: PAGE_SIZE, sort }),
        placeholderData: (prev) => prev,
    });

    const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

    const handlePageChange = (next: number) => {
        const nextParams = new URLSearchParams(search);
        nextParams.set("page", String(next));
        setSearch(nextParams, { replace: true });
    };

    if (isLoading) return <Spinner />;
    if (isError)
        return (
            <div className="text-red-500 text-center py-10">
                {(error as Error).message}
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">活动列表</h1>

            <SearchBar
                keyword={keyword}
                sort={sort}
                onChange={(next) => {
                    const nextParams = new URLSearchParams(next);
                    nextParams.set("page", "1");
                    setSearch(nextParams, { replace: true });
                }}
            />

            {!data?.data.length && <Empty text="暂无活动" />}

            {data?.data.length ? (
                <>
                    <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {data.data.map((act) => (
                            <ActivityCard key={act.id} activity={act} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <nav className="flex justify-center mt-10 space-x-2">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`btn btn-sm ${
                                        p === page ? "btn-primary" : "btn-ghost"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </nav>
                    )}
                </>
            ) : null}
        </div>
    );
}
