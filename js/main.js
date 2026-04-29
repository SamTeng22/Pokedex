const API_URL = "https://pokeapi.co/api/v2/pokemon";
const root = document.getElementById("root");

const limit = 10;
let allPokemon = [];
let displayedPokemon = [];
let currentCount = 0;
let currentPokemon = null;

const typeChart = {
    normal: { weaknesses: ["rock", "steel", "fighting"] },
    fighting: { weaknesses: ["flying", "poison", "psychic", "bug", "ghost", "fairy"]},
    flying: { weaknesses: ["rock", "steel", "electric"]},
    poison: { weaknesses: ["poison", "ground", "rock", "ghost", "steel"]},
    ground: { weaknesses: ["flying", "bug", "grass"] },
    rock: { weaknesses: ["fighting", "ground", "steel"]},
    bug: { weaknesses: ["fighting", "flying", "poison", "ghost", "steel", "fire", "fairy"]},
    ghost: { weaknesses: ["normal", "dark", "ghost"]},
    steel: { weaknesses: ["steel", "fire", "water", "electric"]},
    fire: { weaknesses: ["rock", "fire", "water", "dragon"]},
    water: { weaknesses: ["water", "grass", "dragon"]},
    grass: { weaknesses: ["flying", "poison", "bug", "steel", "fire", "grass", "dragon"]},
    electric: { weaknesses: ["ground", "grass", "electric", "dragon"]},
    psychic: { weaknesses: ["steel", "psychic", "dark"]},
    ice: { weaknesses: ["steel", "fire", "water", "ice"]},
    dragon: { weaknesses: ["steel", "fairy"]},
    dark: { weaknesses: ["fighting", "dark", "fairy"]},
    fairy: { weaknesses: ["poison", "steel", "fire"]},
};

const fetchAllPokemon = async() => {
    const response = await fetch(`${API_URL}?limit=100000`);
    const data = await response.json();
    return data.results;
}

const getPokemonData = async(name) => {
    const response = await fetch(`${API_URL}/${name}`);
    if (!response.ok) throw new Error(`${name} not found`);
    return response.json();
}

const fetchDetails = async(list) => {
    return Promise.all(list.map((p) => getPokemonData(p.name)));
}

const applyFilters = () => {
    const query = document.getElementById("pokemonName").value.toLowerCase();
    const sort = document.getElementById("sortSelect").value;

    let result = [...allPokemon];

    if(query) {
        result = result.filter((p) =>
            p.name.includes(query) || String(p.id).includes(query)
        );
    }

    const getId = (p) => parseInt(p.url.split("/").filter(Boolean).pop());

    if(sort=='name-asc') result.sort((a,b) => a.name.localeCompare(b.name));
    if(sort=='name-desc') result.sort((a,b) => b.name.localeCompare(a.name));
    if(sort=='id-asc') result.sort((a,b) => getId(a) - getId(b));
    if(sort=='id-desc') result.sort((a,b) => getId(b) - getId(a));

    displayedPokemon = result;
    currentCount = 0;
    root.innerHTML="";
    loadMore();

}

const renderPokemons = (pokemons) => {
    pokemons.forEach((pokemon) => {
        const card = document.createElement("div");
        card.classList.add("pokemon-card");
        card.addEventListener("click", () => openModal(pokemon))
        const paddedId = String(pokemon.id).padStart(3,"0");
        console.log(paddedId);
        card.innerHTML = `
            <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${paddedId}.png" alt="${pokemon.name}" />
            <h3>#${pokemon.id} ${pokemon.name}</h3>
            <p>${pokemon.types.map((t) => t.type.name).join(", ")}</p>
        `;
        root.appendChild(card);
    });
};

const loadMore = async() => {
    const batch = displayedPokemon.slice(currentCount, currentCount + limit);
    if(batch.length == 0) return;
    const details = await fetchDetails(batch);
    renderPokemons(details);
    currentCount += limit;

    if (currentCount >= displayedPokemon.length) {
        document.getElementById("loadMore").style.display = "none";
    } else {
        document.getElementById("loadMore").style.display = "block";
    }
};

const getWeaknesses = (types) => {
    const weaknesses = new Set();
    types.forEach((t) => {
        const type = t.type.name;
        if(typeChart[type]){
            typeChart[type].weaknesses.forEach((w) => weaknesses.add(w));
        }
    });
    return [...weaknesses];
}

const init = async () => {
    const list = await fetchAllPokemon();
    allPokemon = list;
    displayedPokemon = list;
    loadMore();
}

const openModal = (pokemon) => {
    currentPokemon = pokemon;
    const paddedId = String(pokemon.id).padStart(3, "0");
    const weaknesses = getWeaknesses(pokemon.types);
    document.getElementById("modalImg").src = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${paddedId}.png`;
    document.getElementById("modalName").textContent = `#${pokemon.id} ${pokemon.name}`;
    document.getElementById("modalTypes").innerHTML = `<strong>Types:</strong> ${pokemon.types.map((t) => t.type.name).join(", ")}`;
    document.getElementById("modalHeight").innerHTML = `<strong>Height:</strong> ${pokemon.height / 10}m`;
    document.getElementById("modalWeight").innerHTML = `<strong>Weight:</strong> ${pokemon.weight / 10}kg`;
    document.getElementById("modalStats").innerHTML = `<strong>Stats:</strong>\n${pokemon.stats.map((a) => `${a.stat.name}: ${a.base_stat}`).join("\n")}`;
    document.getElementById("modalAbilities").innerHTML = `<strong>Abilities:</strong> ${pokemon.abilities.map((a) => a.ability.name).join(", ")}`;
    document.getElementById("modalWeaknesses").innerHTML = `<strong>Weaknesses:</strong> ${weaknesses.join(", ")}`;
    document.getElementById("modalOverlay").classList.add("active");
};

const closeModal = () => {
    document.getElementById("modalOverlay").classList.remove("active");
};

const changeModal = async (pokemon, direction) => {
    const newPokemonId = direction == 'back' ? pokemon.id -1 : pokemon.id + 1;
    const newPokemon = await getPokemonData(newPokemonId);
    openModal(newPokemon) 
};

init();

document.getElementById("loadMore").addEventListener("click", loadMore);
document.getElementById("pokemonName").addEventListener("input", applyFilters);
document.getElementById("sortSelect").addEventListener("change", applyFilters);
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("backModal").addEventListener("click", () =>  changeModal(currentPokemon, 'back'));
document.getElementById("nextModal").addEventListener("click", () => changeModal(currentPokemon, 'next'));
document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
});
