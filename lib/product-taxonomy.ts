export const PRODUCT_TAXONOMY = {
  electronics: ['smartphones','feature phones','tablets','laptops','desktops','mini PCs','monitors','TVs','projectors','cameras','action cameras','webcams','drones','headphones','earbuds','speakers','soundbars','microphones','gaming consoles','keyboards','mice','controllers','VR headsets','smartwatches','fitness trackers','chargers','power banks','cables','adapters','routers','storage devices','SSDs','hard drives','printers','scanners','calculators','smart home devices'],
  accessories: ['phone cases','screen protectors','wireless chargers','car mounts','selfie sticks','power adapters','USB hubs','Bluetooth adapters','docking stations','cooling pads'],
  fashion: ['shirts','t-shirts','jeans','trousers','shorts','jackets','coats','hoodies','sweaters','dresses','skirts','sarees','kurtas','ethnic wear','suits','blazers','formal wear','innerwear','sleepwear','sportswear','swimwear','kids clothing','baby clothing','maternity clothing'],
  footwear: ['running shoes','walking shoes','sneakers','formal shoes','boots','sandals','slippers','hiking shoes','football shoes','cricket shoes','basketball shoes','tennis shoes','school shoes','kids shoes','safety shoes'],
  beauty: ['skincare','face wash','moisturizer','sunscreen','serum','makeup','foundation','lipstick','mascara','eyeliner','perfume','deodorant','shampoo','conditioner','trimmers','hair dryers','straighteners'],
  home: ['sofas','beds','mattresses','wardrobes','desks','office chairs','dining tables','bookshelves','cabinets','shoe racks','storage boxes','curtains','carpets','rugs','lamps','mirrors'],
  kitchen: ['refrigerators','ovens','microwaves','air fryers','mixers','blenders','juicers','coffee machines','espresso machines','kettles','toasters','cookware','pressure cookers','pans','knives','dinner sets','lunch boxes'],
  appliances: ['washing machines','dryers','dishwashers','air conditioners','air coolers','heaters','fans','vacuum cleaners','air purifiers','humidifiers','water purifiers','irons','sewing machines'],
  sports: ['gym equipment','dumbbells','barbells','treadmills','exercise bikes','yoga mats','resistance bands','cricket equipment','football equipment','tennis equipment','badminton equipment','swimming equipment','cycling equipment','hiking equipment'],
  automotive: ['helmets','dashcams','car chargers','car mats','seat covers','tyre accessories','maintenance tools','emergency equipment'],
  travel: ['suitcases','backpacks','travel bags','laptop bags','passport holders','travel adapters','neck pillows','packing cubes','toiletry bags','camping equipment','tents','sleeping bags'],
  baby: ['diapers','strollers','car seats','cribs','feeding bottles','toys','educational toys','school supplies','baby monitors'],
  pets: ['dog food','cat food','collars','leashes','pet beds','pet toys','grooming products','feeding bowls','pet carriers'],
  office: ['notebooks','pens','pencils','markers','backpacks','stationery','files','folders','whiteboards','projectors'],
  tools: ['drills','screwdrivers','hammers','saws','tool kits','measuring tools','ladders','gardening tools'],
  hobbies: ['art supplies','painting supplies','model kits','collectibles','craft supplies','puzzles','board games','musical instruments'],
} as const

export const TAXONOMY_TERMS = Object.values(PRODUCT_TAXONOMY).flat()
export type TaxonomyCategory = keyof typeof PRODUCT_TAXONOMY
