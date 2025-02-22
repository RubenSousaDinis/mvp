import React, { useState } from "react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { patch, post, destroy } from "src/utils/requests";

import Button from "../../../button";

const EditService = ({
  talent,
  selectedService,
  setMode,
  services,
  updateSharedState,
}) => {
  const [saving, setSaving] = useState(false);
  const [destroying, setDestroying] = useState(false);
  const [servicesInfo, setServicesInfo] = useState({
    id: selectedService.id || "",
    title: selectedService.title || "",
    price: selectedService.price || "",
  });

  const changeAttribute = (attribute, value) => {
    setServicesInfo((prevInfo) => ({ ...prevInfo, [attribute]: value }));
  };

  const handleDestroy = async (e) => {
    e.preventDefault();
    setDestroying(true);
    const response = await destroy(
      `/api/v1/talent/${talent.id}/services/${servicesInfo["id"]}`
    ).catch(() => setDestroying(false));

    if (response) {
      const serviceIndex = services.findIndex(
        (service) => service.id == servicesInfo["id"]
      );
      let newServices = [...services];
      if (serviceIndex > -1) {
        newServices.splice(serviceIndex, 1);
      }

      updateSharedState((prevState) => ({
        ...prevState,
        services: newServices,
      }));
    }

    setDestroying(false);
    setMode("view");
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setMode("view");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    let requestType, url;
    if (servicesInfo["id"] != "") {
      requestType = patch;
      url = `/api/v1/talent/${talent.id}/services/${servicesInfo["id"]}`;
    } else {
      requestType = post;
      url = `/api/v1/talent/${talent.id}/services`;
    }

    const response = await requestType(url, {
      service: {
        price: servicesInfo["price"],
        title: servicesInfo["title"],
      },
    }).catch(() => setSaving(false));

    if (response) {
      const serviceIndex = services.findIndex(
        (service) => service.id == servicesInfo["id"]
      );
      let newServices = [...services];
      if (serviceIndex > -1) {
        newServices.splice(serviceIndex, 1);
      }

      newServices.push(response);
      newServices.sort((fItem, lItem) => {
        if (fItem.price > lItem.price) {
          return 1;
        } else if (fItem.price < lItem.price) {
          return -1;
        }
        return 0;
      });

      updateSharedState((prevState) => ({
        ...prevState,
        services: newServices,
      }));
    }

    setSaving(false);
    setMode("view");
  };

  const allowSave = () =>
    servicesInfo["price"] != "" && servicesInfo["title"] != "";

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="form-group">
        <label htmlFor="title">Price *</label>
        <input
          id="price"
          className="form-control"
          placeholder="Amount of your Talent Token required"
          value={servicesInfo["price"]}
          onChange={(e) => changeAttribute("price", e.target.value)}
        />
      </div>
      <div className="form-group">
        <div className="d-flex flex-row justify-content-between">
          <label htmlFor="title">Description *</label>
          <label htmlFor="title">
            <small className="text-muted">
              {servicesInfo["title"]?.length || 0} of 45
            </small>
          </label>
        </div>
        <textarea
          rows={3}
          id="title"
          className="form-control"
          maxLength={45}
          placeholder="Describe the service"
          value={servicesInfo["title"]}
          onChange={(e) => changeAttribute("title", e.target.value)}
        />
      </div>
      <p className="my-3">* Field is required.</p>
      <div className="mb-2 d-flex flex-row-reverse align-items-end">
        <button
          disabled={saving || !allowSave()}
          onClick={handleSave}
          className="btn btn-primary talent-button ml-2"
        >
          {saving ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Saving
            </>
          ) : (
            "Save"
          )}
        </button>
        <Button type="secondary" text="Cancel" onClick={handleCancel} />
        {servicesInfo["id"] != "" && (
          <button
            disabled={destroying}
            onClick={handleDestroy}
            className="btn btn-danger talent-button mr-2"
          >
            {destroying ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Delete
              </>
            ) : (
              "Delete"
            )}
          </button>
        )}
      </div>
    </form>
  );
};

const ViewServices = ({ services, setSelectedService }) => {
  return (
    <div className="d-flex flex-column mt-3">
      {services.length == 0 && (
        <li className="list-group-item">
          <small className="text-muted">
            Start by creating your first service!
          </small>
        </li>
      )}
      {services.map((service) => {
        return (
          <button
            key={`service_${service.id}`}
            className="btn btn-outline-secondary w-100 rounded-0 text-left mt-2"
            onClick={() => setSelectedService(service)}
          >
            <div className="d-flex flex-row w-100 justify-content-between">
              <h5 className="mb-1">
                {service.price} <small>Talent Tokens</small>
              </h5>
            </div>
            <p className="mb-1">{service.title}</p>
          </button>
        );
      })}
    </div>
  );
};

const Services = (props) => {
  const [mode, setMode] = useState("view");
  const [selectedService, setSelectedService] = useState({});

  const selectService = (service) => {
    setSelectedService(service);
    setMode("edit");
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setSelectedService({});
  };

  return (
    <div className="col-md-8 mx-auto d-flex flex-column my-3">
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h4>Services</h4>
        {mode != "edit" && (
          <Button
            type="primary"
            text="Add Service"
            onClick={() => setMode("edit")}
          />
        )}
      </div>
      {mode == "edit" && (
        <EditService
          {...props}
          selectedService={selectedService}
          setMode={changeMode}
        />
      )}
      {mode == "view" && (
        <ViewServices {...props} setSelectedService={selectService} />
      )}
    </div>
  );
};

export default Services;
