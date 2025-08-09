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
        <div className="flex items-center gap-3 p-1 rounded-full bg-base-100/80 shadow-lg">
            {/* 搜索图标 */}
            <svg
                className="w-5 h-5 ml-3 shrink-0 text-base-content/60"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>

            {/* 输入框 */}
            <input
                type="text"
                placeholder="搜索活动"
                value={localKw}
                onChange={(e) => {
                    setLocalKw(e.target.value);
                    debounce(e.target.value);
                }}
                className="input input-ghost input-sm w-full max-w-xs focus:outline-none"
            />

            {/* 分隔线 */}
            <div className="h-5 w-px bg-base-300" />

            {/* 排序下拉框 */}
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
                className="select select-ghost select-sm focus:outline-none"
            >
                <option value="createdAt_DESC">最新发布</option>
                <option value="startAt_ASC">时间升序</option>
            </select>

            {/* 右侧占位，让圆环完整 */}
            <div className="w-2" />
        </div>
    );
}
