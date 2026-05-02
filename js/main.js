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
const colorChart = {
    normal: "#a4acaf" ,
    fighting: "#d56723" ,
    flying: "linear-gradient(to bottom, #3dc7ef, #bdb9b8)",
    poison: "#b97fc9",
    ground: "linear-gradient(to bottom, #f7de3f, #ab9842)",
    rock: "#a38c21",
    bug: "#729f3f",
    ghost: "#7b62a3",
    steel: "#9eb7b8",
    fire: "#fd7d24",
    water: "#4592c4",
    grass: "#9bcc50",
    electric: "#eed535",
    psychic: "#f366b9",
    ice: "#51c4e7",
    dragon: "linear-gradient(to bottom, #53a4cf, #f16e57)",
    dark: "#707070",
    fairy: "#fdb9e9",
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

    const getId = (p) => parseInt(p.url.split("/").filter(Boolean).pop());

    let result = [...allPokemon];

    if(query) {
        console.log(`qury: ${query}`);
        result = result.filter((p) =>
            p.name.includes(query) || String(getId(p)).includes(query)
        );
    }

    

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
        card.classList.add("pokemon-card", "rounded-lg", "p-4", "text-start", "capitalize", "border", "transition-all", "duration-300", "ease-in-out", "hover:-translate-y-2.5", "hover:shadow-xl", "hover:cursor-pointer");
        card.addEventListener("click", () => openModal(pokemon))
        const paddedId = String(pokemon.id).padStart(3,"0");
        console.log(paddedId);
        const typeHTML = pokemon.types.map((t) => {
            const color = colorChart[t.type.name];
            return `<span class="px-2 py-1 rounded text-white text-xs font-bold" style="background:${color}">${t.type.name}</span>`;
        }).join("");
        card.innerHTML = `
            <img class="w-full h-auto" src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${paddedId}.png" alt="${pokemon.name}"  onerror="this.outerHTML='<div class=&quot;w-full h-48 flex items-center justify-center bg-gray-200 rounded text-gray-500 font-bold&quot;>No Image</div>'"/>
            <p class="text-[#919191] font-bold text-[80%] pt-0.5">#${paddedId}</p>
            <h3 class="font-bold text-xl mt-2">${pokemon.name}</h3>
            <p><strong>Types:</strong> <div class="flex gap-2 mt-1 justify-start">${typeHTML}</div></p>
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
    const typeHTML = pokemon.types.map((t) => {
        const color = colorChart[t.type.name];
        return `<span class="px-2 py-1 rounded text-white text-xs font-bold" style="background:${color}">${t.type.name}</span>`;
    }).join("");
    const weaknessHTML =weaknesses.map((t) => {
        const color = colorChart[t];
        return `<span class="px-2 py-1 rounded text-white text-xs font-bold" style="background:${color}">${t}</span>`;
    }).join("");
    document.getElementById("modalImg").src = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${paddedId}.png`;
    document.getElementById("modalName").textContent = `#${pokemon.id} ${pokemon.name}`;
    document.getElementById("modalTypes").innerHTML = `<strong>Types:</strong> <div class="flex gap-2 mt-1 justify-center">${typeHTML}</div>`;
    document.getElementById("modalHeight").innerHTML = `<strong>Height:</strong> ${pokemon.height / 10}m`;
    document.getElementById("modalWeight").innerHTML = `<strong>Weight:</strong> ${pokemon.weight / 10}kg`;
    document.getElementById("modalStats").innerHTML = `<strong>Stats:</strong><br>${pokemon.stats.map((a) => `<span class="font-semibold">${a.stat.name}:</span> ${a.base_stat}`).join("<br>")}`;
    document.getElementById("modalAbilities").innerHTML = `<strong>Abilities:</strong> ${pokemon.abilities.map((a) => a.ability.name).join(", ")}`;
    document.getElementById("modalWeaknesses").innerHTML = `<strong>Weaknesses:</strong> <div class="flex flex-wrap gap-2 mt-1 justify-center">${weaknessHTML}</div>`;
    document.getElementById("modalOverlay").classList.remove("hidden");
    document.getElementById("modalOverlay").classList.add("flex");
};

const closeModal = () => {
    document.getElementById("modalOverlay").classList.add("hidden");
    document.getElementById("modalOverlay").classList.remove("flex");};

const changeModal = async (pokemon, direction) => {
    const newPokemonId = direction == 'back' ? pokemon.id -1 : pokemon.id + 1;
    const newPokemon = await getPokemonData(newPokemonId);
    openModal(newPokemon) 
};

init();

document.getElementById("loadMore").addEventListener("click", loadMore);
document.getElementById("pokemonFilter").addEventListener("submit", (e) => {
    e.preventDefault();
    applyFilters();
});
document.getElementById("sortSelect").addEventListener("change", applyFilters);
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("backModal").addEventListener("click", () =>  changeModal(currentPokemon, 'back'));
document.getElementById("nextModal").addEventListener("click", () => changeModal(currentPokemon, 'next'));
document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
});
