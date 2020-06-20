export default function transform(el, position) {
    let transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${position.x},${position.y},0,1)`;

    el.style.webkitTransform = transform;
    el.style.msTransform = transform;
    el.style.transform = transform;
}