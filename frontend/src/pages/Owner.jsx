import { Outlet } from "react-router-dom";

function Owner(){
  return (
    <div>
      <div>
        <h1>Owner Main Layout</h1>
      </div>
      <div>
        <Outlet/>
      </div>
    </div>
  )
}
export default Owner;