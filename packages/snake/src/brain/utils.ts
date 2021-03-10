export function samePoint(point1: [number, number], point2: [number, number]): boolean {
    return point1[0] === point2[0] && point1[1] === point2[1]
}

export function minus (point1: [number, number], point2: [number, number]): [number, number] {
    return [
        point1[0] - point2[0],
        point1[1] - point2[1]
    ]
}

export function manhattanDis (point1: [number, number], point2: [number, number]): number {
    return point1[0] - point2[0], point1[1] - point2[1];
}

export function snakeSelfPos (snake: [number, number][]): [number, number] {
    let minDis: [number, number] = [Infinity, Infinity];
    const head = snake[0];
    // 只有长于5时蛇才会撞到自己
    let checkParts = snake.slice(4);
    for (let i = 0; i < checkParts.length; i++) {
        const dx = snake[i][0] - head[0];
        const dy = snake[i][1] - head[1];
        if (Math.abs(dx) < Math.abs(minDis[0])) minDis[0] = dx;
        if (Math.abs(dy) < Math.abs(minDis[1])) minDis[1] = dy;
    }
    return minDis
}

export function allZeros (arr: number[]): boolean {
    return arr.every(n => n === 0);
}

export function maxIndex(arr: number[]): number {
    let index = 0;
    let _max = -Infinity;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > _max) {
            _max = arr[i];
            index = i;
        }
    }
    return index;
}

export function oppsite (dir1: [number, number], dir2: [number, number]): boolean {
    return dir1[0] + dir2[0] === 0 && dir1[1] + dir2[1] === 0
}