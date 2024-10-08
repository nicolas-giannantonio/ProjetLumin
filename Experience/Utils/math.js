const Round = (value, decimals) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

const Remap = (value, min1, max1, min2, max2) => {
    return Lerp(min2, max2, InvLerp(value, min1, max1));
};

const InvLerp = (value, min, max) => {
    return (value - min) / (max - min);
};

const Clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

const Lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end;
};

export {
    Round,
    Remap,
    Clamp,
    Lerp,
    InvLerp,
};
