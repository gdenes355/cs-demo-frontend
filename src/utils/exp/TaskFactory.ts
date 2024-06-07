import { prod, randBool, randElement, randInt, round2 } from "../MathUtils";
import TaskModel from "./TaskModel";

interface ITaskFactory {
  createTask(): TaskModel;
}

type TaskFactoryProperies = {
  audio?: boolean;
  bitmap?: boolean;
  network?: boolean;
  resolution?: boolean;
};

function sizeRConvert(sizeRaw: number) {
  let sizeU = "bytes";
  let size: Array<number> = [];

  sizeRaw = sizeRaw / 8;

  if (sizeRaw > 1024 * 1024 * 1024) {
    sizeU = "gibibytes";
    size.push(1024);
    size.push(1024);
    size.push(1024);
    sizeRaw = round2(sizeRaw / 1024 / 1024 / 1024);
  } else if (sizeRaw > 1024 * 1024) {
    sizeU = "mebibytes";
    size.push(1024);
    size.push(1024);
    sizeRaw = round2(sizeRaw / 1024 / 1024);
  } else if (sizeRaw > 1024) {
    sizeU = "kibibytes";
    size.push(1024);
    sizeRaw = round2(sizeRaw / 1024);
  } else {
    sizeRaw = round2(sizeRaw);
  }
  size = [sizeRaw, ...size, 8];
  return { size, sizeU };
}

class BitmapTaskFactory implements ITaskFactory {
  numeratorLabel = "size (bits)";
  denominatorLabels = ["w", "h", "col depth"];

  createPlausibleEq() {
    let w = randElement([2, 4, 8, 16, 32, 64, 128, 160, 320, 640, 1920, 3840]);
    let h = randElement([2, 4, 8, 16, 32, 64, 128, 120, 240, 480, 1080, 2160]);

    let bd = randElement([
      //no 8, as the equation simplifies easily then
      1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24,
    ]);

    const { size, sizeU } = sizeRConvert(w * h * bd);
    return { w, h, bd, size, sizeU };
  }

  createTaskSize() {
    let eq = this.createPlausibleEq();
    let numerator = [eq.bd, eq.w, eq.h];
    let denominator = eq.size.slice(1);
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the file size of an image with a ${eq.bd}-bit colour depth, with a size of ${eq.w}x${eq.h} pixels. Your answer should be in ${eq.sizeU}. `;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskColourDepth() {
    let eq = this.createPlausibleEq();
    let numerator = eq.size;
    let denominator = [eq.w, eq.h];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the colour depth of an image with a file size of  ${eq.size[0]} ${eq.sizeU}, a width of ${eq.w} and a height of ${eq.h} pixels.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskWidth() {
    let eq = this.createPlausibleEq();
    let numerator = eq.size;
    let denominator = [eq.h, eq.bd];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the width of a bitmap image in pixels. The image has a file size of  ${eq.size[0]} ${eq.sizeU}, a colour depth of ${eq.bd} and a height of ${eq.h} pixels.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTask() {
    let r = randInt(0, 2);
    switch (r) {
      case 0:
        return this.createTaskSize();
      case 1:
        return this.createTaskColourDepth();
      default:
        return this.createTaskWidth();
    }
  }
}

class ResolutionTaskFactory implements ITaskFactory {
  numeratorLabel = "size (px)";
  denominatorLabels = ["size (inch)", "resolution (PPI)"];
  createPlausibleEq() {
    let wpx = randInt(8, 3840);
    let wInch = randInt(1, 20);
    let resolution = Math.round(wpx / wInch);
    return { wpx, wInch, resolution };
  }

  createTaskPhysicalSize() {
    let eq = this.createPlausibleEq();
    let numerator = [eq.wpx];
    let denominator = [eq.resolution];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the physical width of a ${eq.wpx} pixel wide image that is displayed at ${eq.resolution}PPI.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskResolution() {
    let eq = this.createPlausibleEq();
    let numerator = [eq.wpx];
    let denominator = [eq.wInch];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the resolution of a ${eq.wpx} pixel wide image that is displayed over ${eq.wInch} inches.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskImageSize() {
    let eq = this.createPlausibleEq();
    let numerator = [eq.resolution, eq.wInch];
    let denominator: number[] = [];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the width of a ${eq.resolution}PPI image in pixels. The image is displayed over ${eq.wInch} inches.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTask(): TaskModel {
    let r = randInt(0, 2);
    switch (r) {
      case 0:
        return this.createTaskPhysicalSize();
      case 1:
        return this.createTaskResolution();
      default:
        return this.createTaskImageSize();
    }
  }
}

class NetworkTaskFactory implements ITaskFactory {
  numeratorLabel = "size (bits)";
  denominatorLabels = ["time (s)", "bandwidth (bps)"];

  createPlausibleEq() {
    let size = [randInt(1, 100), 8];
    let time = [randInt(2, 59)];

    let sizeU = "bytes";
    if (randBool()) {
      sizeU = "kibibytes";
      size.push(1024);
      if (randBool()) {
        sizeU = "mebibytes";
        size.push(1024);
        if (randBool()) {
          sizeU = "gibibytes";
          size.push(1024);
        }
      }
    }

    let timeU = "seconds";
    if (randBool() && prod(size) / prod(time) > 60) {
      time.push(60);
      timeU = "minutes";
      if (randBool() && prod(size) / prod(time) > 60) {
        time.push(60);
        timeU = "hours";
      }
    }

    let bandwidthRaw = prod(size) / prod(time);
    let bandwidthU = "bps";
    let bandwidth = [];

    if (bandwidthRaw > 1000) {
      bandwidthU = "kbps";
      bandwidthRaw /= 1000;
      bandwidth.push(1000);
      if (bandwidthRaw > 1000) {
        bandwidthU = "Mbps";
        bandwidthRaw /= 1000;
        bandwidth.push(1000);
        if (bandwidthRaw > 1000) {
          bandwidthU = "Gbps";
          bandwidthRaw /= 1000;
          bandwidth.push(1000);
        }
      }
    }
    bandwidth = [round2(bandwidthRaw), ...bandwidth];
    return { size, sizeU, time, timeU, bandwidth, bandwidthU };
  }

  createTaskBandwidth(): TaskModel {
    let eq = this.createPlausibleEq();
    let numerator = eq.size;
    let denominator = [...eq.time, ...eq.bandwidth.slice(1)];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the network transmission speed if a file of ${eq.size[0]} ${eq.sizeU} was downloaded in ${eq.time[0]} ${eq.timeU}. Your answer should be in ${eq.bandwidthU}.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskTime(): TaskModel {
    let eq = this.createPlausibleEq();
    let numerator = eq.size;
    let denominator = [...eq.bandwidth, ...eq.time.slice(1)];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `If you have a network connection of ${eq.bandwidth[0]}${eq.bandwidthU} and you want to download a file that is ${eq.size[0]} ${eq.sizeU}, how long will it take? Your answer should be in ${eq.timeU}.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskFileSize(): TaskModel {
    let eq = this.createPlausibleEq();
    let numerator = [...eq.time, ...eq.bandwidth];
    let denominator = eq.size.slice(1);
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `If you have a network connection of ${eq.bandwidth[0]}${eq.bandwidthU} and it took ${eq.time[0]} ${eq.timeU} to download a file, how large was the file? Your answer should be in ${eq.sizeU}.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTask(): TaskModel {
    let r = randInt(0, 2);
    switch (r) {
      case 0:
        return this.createTaskBandwidth();
      case 1:
        return this.createTaskTime();
      default:
        return this.createTaskFileSize();
    }
  }
}

class AutioTaskFactory implements ITaskFactory {
  numeratorLabel = "size (bits)";
  denominatorLabels = ["time (s)", "sample rate (Hz)", "bit depth"];
  createPlausibleEq() {
    let rate = [randInt(2, 100)];
    let bd = [randInt(1, 32)];
    let duration = [randInt(2, 59)];

    let rateU = "Hz";
    if (randBool()) {
      rateU = "kHz";
      rate.push(1000);
    }

    let durationU = "seconds";
    if (randBool()) {
      duration.push(60);
      durationU = "minutes";
      if (randBool()) {
        duration.push(60);
        durationU = "hours";
      }
    }

    const { size, sizeU } = sizeRConvert(prod(rate) * bd[0] * prod(duration));

    return { rate, rateU, bd, duration, durationU, size, sizeU };
  }

  createTaskFileSize() {
    let eq = this.createPlausibleEq();
    let numerator = [...eq.rate, ...eq.bd, ...eq.duration];
    let denominator = eq.size.slice(1);

    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the file size of a sound file with a sample rate of ${eq.rate[0]} ${eq.rateU}, a bit depth of ${eq.bd[0]} and a duration of ${eq.duration[0]} ${eq.durationU}. Your answer should be in ${eq.sizeU}.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskRate() {
    let eq = this.createPlausibleEq();
    let numerator = eq.size;
    let denominator = [...eq.bd, ...eq.duration, ...eq.rate.slice(1)];

    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the sample rate of a sound file with a file size of  ${eq.size[0]} ${eq.sizeU}, a bit depth of ${eq.bd[0]} and a duration of ${eq.duration[0]} ${eq.durationU}. Your answer should be in ${eq.rateU}.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskDuration() {
    let eq = this.createPlausibleEq();
    let numerator = eq.size;
    let denominator = [...eq.bd, ...eq.rate, ...eq.duration.slice(1)];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the duration of a sound file with a file size of  ${eq.size[0]} ${eq.sizeU}, a bit depth of ${eq.bd[0]} and a sample rate of ${eq.rate[0]} ${eq.rateU}. Your answer should be in ${eq.durationU}.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTaskBitDepth() {
    let eq = this.createPlausibleEq();
    let numerator = eq.size;
    let denominator = [...eq.duration, ...eq.rate];
    let customValues = [...new Set([...numerator, ...denominator])];
    let text = `Construct an expression to calculate the bit depth of a sound file with a file size of  ${eq.size[0]} ${eq.sizeU}, a duration of ${eq.duration[0]} ${eq.durationU} and a sample rate of ${eq.rate[0]} ${eq.rateU}.`;
    return {
      text,
      numerator,
      denominator,
      customValues,
      numeratorLabel: this.numeratorLabel,
      denominatorLabels: this.denominatorLabels,
    };
  }

  createTask() {
    let r = randInt(0, 3);
    switch (r) {
      case 0:
        return this.createTaskBitDepth();
      case 1:
        return this.createTaskDuration();
      case 2:
        return this.createTaskFileSize();
      default:
        return this.createTaskRate();
    }
  }
}

class TaskFactory {
  public static createTask(props: TaskFactoryProperies) {
    const { audio, bitmap, resolution, network } = props;

    let factories: Array<ITaskFactory> = [];
    if (audio) {
      factories.push(new AutioTaskFactory());
    }

    if (bitmap) {
      factories.push(new BitmapTaskFactory());
    }

    if (resolution) {
      factories.push(new ResolutionTaskFactory());
    }

    if (network) {
      factories.push(new NetworkTaskFactory());
    }

    if (factories.length === 0) {
      //throw new Error("Cannot create new task");
      factories.push(new BitmapTaskFactory()); // avoid failing, as the error isn't handled at the moment
    }
    let factory = randElement(factories);
    return factory.createTask();
  }
}

export default TaskFactory;
