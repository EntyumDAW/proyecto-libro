import { FormControl, InputLabel, TextField, Select, MenuItem } from "@mui/material";


export const CreateEjemplar = ({ejemplar, setEjemplar}) => {

    const handleChange = (e) => {
        setEjemplar({
            ...ejemplar,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
        <TextField
            name="precio"
            label="Price"
            type="number"
            value={ejemplar.precio}
            onChange={handleChange}
            fullWidth
            margin="normal"
        />

        <TextField
            name="stock"
            label="Stock"
            type="number"
            value={ejemplar.stock}
            onChange={handleChange}
            fullWidth
            margin="normal"
        />
    <FormControl fullWidth margin="normal">
        <InputLabel>Condition</InputLabel>
        <Select
            name="condicion"
            label="Condition"
            value={ejemplar.condicion}
            onChange={handleChange}
        > 
        <MenuItem value="nuevo">New</MenuItem>
        <MenuItem value="como_nuevo">Like new</MenuItem>
        <MenuItem value="buen_estado">Good</MenuItem>
        <MenuItem value="regular">Fair</MenuItem>
        </Select>
        </FormControl>

    <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
            name="estado"
            value={ejemplar.estado}
            onChange={handleChange}
            label="Estado"
            > 
        <MenuItem value="disponible">Available</MenuItem>
        <MenuItem value="reservado">Reserved</MenuItem>
        <MenuItem value="vendido">Sold</MenuItem>
        <MenuItem value="intercambiado">Exchanged</MenuItem>
        </Select>
        </FormControl>

        <TextField
            name="descripcion_estado"
            label="Condition details"
            multiline
            rows={3}
            value={ejemplar.descripcion_estado}
            onChange={handleChange}
            fullWidth
            margin="normal"
        />
        </>
    )
}