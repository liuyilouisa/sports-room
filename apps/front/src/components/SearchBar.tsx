import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

interface Props {
    keyword: string;
    sort: string;
    onChange: (next: URLSearchParams) => void;
}

export default function SearchBar({ keyword, sort, onChange }: Props) {
    const [localKw, setLocalKw] = useState(keyword);
    const debounce = useDebouncedCallback((val: string) => {
        const next = new URLSearchParams({ sort });
        if (val.trim()) next.set("keyword", val.trim());
        next.set("page", "1");
        onChange(next);
    }, 300);

    useEffect(() => setLocalKw(keyword), [keyword]);

    return (
        <div className="flex gap-4 items-center">
            <input
                type="text"
                placeholder="搜索活动"
                value={localKw}
                onChange={(e) => {
                    setLocalKw(e.target.value);
                    debounce(e.target.value);
                }}
                className="input input-bordered w-full max-w-xs"
            />
            <select
                value={sort}
                onChange={(e) => {
                    const next = new URLSearchParams({
                        keyword,
                        sort: e.target.value,
                    });
                    next.set("page", "1");
                    onChange(next);
                }}
                className="select select-bordered"
            >
                <option value="createdAt_DESC">最新发布</option>
                <option value="startAt_ASC">时间升序</option>
            </select>
        </div>
    );
}
