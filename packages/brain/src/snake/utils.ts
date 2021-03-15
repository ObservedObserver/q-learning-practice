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
    let minDisPoint: [number, number] = [Infinity, Infinity];
    let minDis = Infinity;
    const head = snake[0];
    // 只有长于5时蛇才会撞到自己
    let checkParts = snake.slice(4);
    for (let i = 0; i < checkParts.length; i++) {
        const dx = snake[i][0] - head[0];
        const dy = snake[i][1] - head[1];
        if (Math.abs(dx) + Math.abs(dy) < minDis) {
            minDis = Math.abs(dx) + Math.abs(dy);
            minDisPoint = [...snake[i]]
        }
    }
    return minDisPoint
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

export function maxIndexIgnore(arr: number[], ignoreIndex: number): number {
    let index = 0;
    let _max = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      if (i !== ignoreIndex && arr[i] > _max) {
        _max = arr[i];
        index = i;
      }
    }
    return index;
}

export function oppsite (dir1: [number, number], dir2: [number, number]): boolean {
    return dir1[0] + dir2[0] === 0 && dir1[1] + dir2[1] === 0
}

export function bbox (points: [number, number][]): [[number, number], [number, number]] {
    let _minX = 0;
    let _minY = 0;
    let _maxX = 0;
    let _maxY = 0;
    for (let i = 0; i < points.length; i++) {
        _maxX = Math.max(_maxX, points[i][0])
        _minX = Math.min(_minX, points[i][0]);
        _maxY = Math.max(_maxY, points[i][1]);
        _minY = Math.max(_minY, points[i][1]);
    }
    return [[_minX, _minY], [_maxX, _maxY]]
}