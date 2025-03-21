export default function Products({data}) {
    console.log(data)
    return (
        <>
            <div className="grid  grid-col-2 lg:grid-cols-4 px-8 py-8">
                {
                    data.map((value, index) => {
                        return (
                            <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
                                <img className="w-full h-48 object-cover" src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${value.mainImage}`} alt={value.name} />
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">{value.name}</div>
                                    <p className="text-gray-700 text-base font-semibold mb-2">${value.price}</p>
                                    <p className="text-gray-600 text-sm truncate">{value.description}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}