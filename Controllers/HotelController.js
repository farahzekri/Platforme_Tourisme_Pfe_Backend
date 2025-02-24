
const Hotel = require('../Models/Hotel');
const B2B = require('../Models/b2b');

const createHotel =async(req,res)=>{
    try{
        const b2bId = req.user.id; 

        if (!b2bId) {
            return res.status(403).json({ message: "Accès non autorisé. B2B non trouvé." });
        }
        const {name,country,city,stars,Typecontract,minChildAge,maxChildAge,address,tripAdvisorLink,rooms,childrenCategories,options,location,themes,arrangement,amenities,supplements,Jourdeweekend,image}=req.body
        
       
    
          const newHotel = new Hotel({
            b2bId,
            name,
            country,
            city,
            stars,
            Typecontract,
            minChildAge,
            maxChildAge,
            address,
            tripAdvisorLink,
            rooms,
            childrenCategories,
            options,
            location,
            themes,
            arrangement,
            amenities,
            supplements,
            Jourdeweekend,
            image,
          });
      
         
          const savedHotel = await newHotel.save();
          await B2B.findByIdAndUpdate(b2bId, { $push: { hotels: savedHotel._id } });
      
          res.status(201).json({ message: "Hôtel ajouté avec succès", hotel: newHotel });  
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'ajout de l'hôtel" });
    }

}
const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().populate("b2bId", "nameAgence email"); // Pour inclure les infos de l'agence
        res.status(200).json(hotels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des hôtels." });
    }
};
const getHotelsByB2B = async (req, res) => {
    try {
        const b2bId = req.user.id;

        if (!b2bId) {
            return res.status(401).json({ message: "Utilisateur non autorisé." });
        }
        const hotels = await Hotel.find({ b2bId });
        if (!hotels.length) {
            return res.status(404).json({ message: "Aucun hôtel trouvé pour ce B2B." });
        }
        res.status(200).json(hotels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des hôtels du B2B." });
    }
};

const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedHotel = await Hotel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedHotel) {
            return res.status(404).json({ message: "Hôtel non trouvé." });
        }

        res.status(200).json({ message: "Hôtel mis à jour avec succès.", hotel: updatedHotel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'hôtel." });
    }
};
const deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;

        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ message: "Hôtel non trouvé." });
        }

        await B2B.findByIdAndUpdate(hotel.b2bId, { $pull: { hotels: id } });
        await Hotel.findByIdAndDelete(id);


        res.status(200).json({ message: "Hôtel supprimé avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'hôtel." });
    }
};
const getHotelByHotelid = async (req, res) => {
    try {
        // const Hotelid = req.params;

        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: "Hôtel non trouvé" });
        }
       
        res.status(200).json(hotel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération de hôtels." });
    }
};
module.exports={
    createHotel,
    getAllHotels,
    getHotelsByB2B,
    updateHotel,
    deleteHotel,
    getHotelByHotelid,
    
}