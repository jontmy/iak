import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { animated, createSpring } from "solid-spring";

export default function Home() {
    const [isDragging, setIsDragging] = createSignal(false);
    const [rotation, setRotation] = createSignal(0);
    const [startAngle, setStartAngle] = createSignal(0);
    const [ref, setRef] = createSignal<HTMLImageElement>();

    const styles = createSpring(() => ({
        from: { rotation: rotation() },
        to: [{ rotation: rotation() }],
    }));

    const center = createMemo(() => {
        const rect = ref()?.getBoundingClientRect();
        if (!rect) {
            return { x: 0, y: 0 };
        }
        return {
            x: rect.left + rect.width / 2 + window.scrollX,
            y: rect.top + rect.height / 2 + window.scrollY,
        };
    });

    function handleDragStart(e: MouseEvent | TouchEvent) {
        if (isPinchEvent(e)) return;
        const { x, y } = getClientCoordinates(e);
        const angle = Math.atan2(y - center().y, x - center().x);
        setStartAngle(angle);
        setIsDragging(true);
    }

    function handleDragEnd() {
        setIsDragging(false);
    }

    function handleDrag(e: MouseEvent | TouchEvent) {
        if (!isDragging() || isPinchEvent(e)) return;
        e.preventDefault();
        const { x, y } = getClientCoordinates(e);
        const angle = Math.atan2(
            (y - center().y) / window.devicePixelRatio,
            (x - center().x) / window.devicePixelRatio,
        );
        const deltaRotation = (angle - startAngle()) * (180 / Math.PI);
        const newRotation = rotation() + deltaRotation;
        if (deltaRotation > 180) {
            setRotation(rotation() - 360 + deltaRotation);
        } else if (deltaRotation < -180) {
            setRotation(rotation() + 360 + deltaRotation);
        } else {
            setRotation(newRotation);
        }
        setStartAngle(angle);
    }

    onMount(() => {
        document.addEventListener("touchmove", handleDrag, { passive: false });
        document.addEventListener("touchend", handleDragEnd, { passive: false });
        document.addEventListener("touchstart", handleDragStart, { passive: false });
        onCleanup(() => {
            document.removeEventListener("touchmove", handleDrag);
            document.removeEventListener("touchend", handleDragEnd);
            document.removeEventListener("touchstart", handleDragStart);
        });
    });

    return (
        <main
            classList={{
                "fixed h-screen w-screen overflow-hidden": true,
                "cursor-grabbing": isDragging(),
                "cursor-grab": !isDragging(),
            }}
            onMouseUp={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseMove={handleDrag}
        >
            <animated.img
                ref={setRef}
                src="./wheel.png"
                alt="An emotion wheel comprising of 3 rings"
                class="max-w-screen fixed inset-0 m-auto aspect-square max-h-screen object-scale-down"
                draggable="false"
                style={{
                    transform: styles().rotation.to((r) => `rotate(${r}deg)`),
                }}
            />
        </main>
    );
}

function getClientCoordinates(e: MouseEvent | TouchEvent) {
    if (e instanceof MouseEvent) {
        return { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY };
    } else if (e instanceof TouchEvent) {
        return {
            x: e.touches[0].clientX + window.scrollX,
            y: e.touches[0].clientY + window.scrollY,
        };
    }
    return { x: 0, y: 0 };
}

function isPinchEvent(e: Event) {
    if (typeof TouchEvent === "undefined" || !(e instanceof TouchEvent)) {
        return false;
    }
    return e.touches.length > 1;
}
