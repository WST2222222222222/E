export default function roundTen(num) {
    return parseInt((Math.round(num / 10) * 10).toFixed(0))
}