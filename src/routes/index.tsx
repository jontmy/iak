import { createEffect, createMemo, createSignal } from "solid-js";

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

    function handleDragStart(e: MouseEvent | TouchEvent) {
        if (isPinchEvent(e)) {
            return;
        }
        const { x, y } = getClientCoordinates(e);
        const angle = Math.atan2(y - center().y, x - center().x);
        setStartAngle(angle);
        setIsDragging(true);
    }

    function handleDragEnd() {
        setIsDragging(false);
    }

    function handleDrag(e: MouseEvent | TouchEvent) {
        if (!isDragging()) {
            return;
        }
        if (isPinchEvent(e)) {
            return;
        }
        const { x, y } = getClientCoordinates(e);
        const angle = Math.atan2(y - center().y, x - center().x);
        setRotation(rotation() + (angle - startAngle()) * (180 / Math.PI));
        setStartAngle(angle);
    }

    return (
        <main
            class="fixed overflow-hidden"
            onMouseUp={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseMove={handleDrag}
            onTouchEnd={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDrag}
            style={{
                cursor: isDragging() ? "grabbing" : "grab",
            }}
        >
            <img
                ref={setRef}
                src="./wheel.png"
                alt="An emotion wheel comprising of 3 rings"
                class="max-w-screen fixed inset-0 m-auto aspect-square max-h-screen object-scale-down"
                draggable="false"
                style={{
                    transform: `rotate(${rotation()}deg)`,
                }}
            />
        </main>
    );
}

function getClientCoordinates(e: MouseEvent | TouchEvent) {
    if (e instanceof MouseEvent) {
        return { x: e.clientX, y: e.clientY };
    } else if (e instanceof TouchEvent) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: 0, y: 0 };
}

function isPinchEvent(e: Event) {
    if (typeof TouchEvent === "undefined" || !(e instanceof TouchEvent)) {
        return false;
    }
    return e.touches.length > 1;
}
