export function save(parts){
    return JSON.stringify(parts);
}

export function load(json){
    return JSON.parse(json);
}