import { createMemo, createSignal } from "solid-js";

export default function Home() {
    const [isDragging, setIsDragging] = createSignal(false);
    const [rotation, setRotation] = createSignal(0);
    const [startAngle, setStartAngle] = createSignal(0);
    const [ref, setRef] = createSignal<HTMLImageElement>();

    const center = createMemo(() => {
        const rect = ref()?.getBoundingClientRect();
        if (!rect) {
            return {
                x: 0,
                y: 0,
            };
        }
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    });

    function handleMouseDown(e: MouseEvent) {
        const angle = Math.atan2(e.clientY - center().y, e.clientX - center().x);
        setStartAngle(angle);
        setIsDragging(true);
    }

    function handleMouseUp() {
        setIsDragging(false);
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isDragging()) {
            return;
        }
        const angle = Math.atan2(e.clientY - center().y, e.clientX - center().x);
        setRotation(rotation() + (angle - startAngle()) * (180 / Math.PI));
        setStartAngle(angle);
    }

    return (
        <main
            class="flex flex-col items-center justify-center overflow-clip"
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            style={{
                cursor: isDragging() ? "grabbing" : "grab",
            }}
        >
            <img
                ref={setRef}
                src="./wheel.png"
                alt="An emotion wheel comprising of 3 rings"
                class="max-w-screen aspect-square max-h-screen object-scale-down"
                draggable="false"
                style={{
                    transform: `rotate(${rotation()}deg)`,
                }}
            />
        </main>
    );
}
