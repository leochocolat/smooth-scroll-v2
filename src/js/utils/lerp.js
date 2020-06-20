export default function lerp(start, end, value) {
    return (1 - value) * start+ value * end;
}