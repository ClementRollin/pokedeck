import { Pokemon } from './PokeList';  // Importez l'interface depuis PokeList

const PokeCard = ({ pokemon }: { pokemon: Pokemon }) => {
    return (
        <div onClick={() => {
            console.log(pokemon.name);
        }}>
            <h3>{pokemon.name}</h3>
            {
                // Affichez les autres propriétés du Pokémon
            }
        </div>
    );
};

export default PokeCard;
